from http.client import HTTPException
import zoneinfo,uuid,json
from model import *
from sqlalchemy import cast,create_engine 
from sqlalchemy.orm import sessionmaker,aliased
import os
from datetime import datetime,timedelta,time
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()  

connectionString = f'postgresql://postgres:{os.getenv("DB_PASSWORD")}@localhost:5432/appointment_booking_db'
Base = declarative_base()
engine = create_engine(connectionString)
Base.metadata.bind = engine
Base.metadata.create_all(engine)
DBsession = sessionmaker(bind=engine)
session = DBsession()

from datetime import datetime, timedelta
from uuid import UUID
import zoneinfo
from fastapi import HTTPException


def get_available_slots(smb_id: UUID):
    config = get_business_config(smb_id)
    if not config:
        raise HTTPException(404, "Business configuration not found")
    tz = zoneinfo.ZoneInfo(config.timezone)
    now_local = datetime.now(tz)
    business_start = datetime.combine(
        now_local.date(),
        config.start_time,
        tzinfo=tz
    )
    business_end = datetime.combine(
        now_local.date(),
        config.end_time,
        tzinfo=tz
    )
    if business_start.isoweekday() not in config.days:
        return []
    today = now_local.strftime("%Y-%m-%d")
    holidays = {
        h["date"] for h in config.excluded_days if h.get("date")
    }
    if today in holidays:
        return []
    appointments = get_active_appointments(
        smb_id,
        business_start.astimezone(zoneinfo.ZoneInfo("UTC")),
        business_end.astimezone(zoneinfo.ZoneInfo("UTC"))
    )
    booked_slots = {
        appt.slot_start for appt in appointments
    }
    slots = []
    current = business_start
    while current + timedelta(minutes=config.duration) <= business_end:
        slot_start_utc = current.astimezone(zoneinfo.ZoneInfo("UTC"))
        slot_end_utc = (
            current + timedelta(minutes=config.duration)
        ).astimezone(zoneinfo.ZoneInfo("UTC"))
        if current < now_local:
            current += timedelta(minutes=config.duration)
            continue
        if slot_start_utc in booked_slots:
            current += timedelta(minutes=config.duration)
            continue
        slots.append({
            "slot_start": slot_start_utc,
            "slot_end": slot_end_utc
        })
        current += timedelta(minutes=config.duration)
    return slots

from datetime import datetime, timedelta
from uuid import uuid4
import zoneinfo
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
utc_now = datetime.now(zoneinfo.ZoneInfo("UTC"))

def create_appointment(payload: AppointmentCreate):
    config = get_business_config(payload.smb_id)
    if not config:
        raise HTTPException(
            status_code=404,
            detail="Business configuration not found."
        )
    tz = zoneinfo.ZoneInfo(config.timezone)
    local_start = payload.slot_start.astimezone(tz)
    local_end = payload.slot_end.astimezone(tz)
    if payload.slot_start <= datetime.now(zoneinfo.ZoneInfo("UTC")):
        raise HTTPException(
            status_code=400,
            detail="Cannot book a past slot."
        )
    if local_start.isoweekday() not in config.days:
        raise HTTPException(
            status_code=400,
            detail="Business is closed on this day."
        )
    business_start = datetime.combine(
        local_start.date(),
        config.start_time,
        tzinfo=tz
    )
    business_end = datetime.combine(
        local_start.date(),
        config.end_time,
        tzinfo=tz
    )
    if local_start < business_start or local_end > business_end:
        raise HTTPException(
            status_code=400,
            detail="Appointment is outside business hours."
        )
    booking_date = local_start.strftime("%Y-%m-%d")
    for holiday in (config.excluded_days or []):
        if holiday.get("date") == booking_date:
            raise HTTPException(
                status_code=400,
                detail=f"Business closed : {holiday.get('reason')}"
            )
    expected_end = local_start + timedelta(
        minutes=config.duration
    )
    if expected_end != local_end:
        raise HTTPException(
            status_code=400,
            detail=f"Appointment duration should be {config.duration} minutes."
        )
    overlap = get_active_appointments(
        payload.smb_id,
        payload.slot_start,
        payload.slot_end
    )
    if overlap:
        raise HTTPException(
            status_code=409,
            detail="Slot already booked."
        )
    try:
        appointment = add_new_appointment(
            smb_id=payload.smb_id,
            lead_id=uuid4(),
            lead_name=payload.lead_name,
            slot_start=payload.slot_start,
            slot_end=payload.slot_end
        )
        return appointment
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Slot already booked."
        )

def add_new_appointment(smb_id,lead_id,lead_name,slot_start,slot_end):
    appointment = Appointment(
        smb_id=smb_id,
        lead_id=lead_id,
        lead_name=lead_name,
        slot_start=slot_start,
        slot_end=slot_end,
        status="ACTIVE"
    )
    try:
        session.add(appointment)
        session.commit()
        session.refresh(appointment)
        return appointment
        
    except IntegrityError:
        session.rollback()

        raise HTTPException(
            status_code=409,
            detail="Slot already booked."
        )    
def update_appointment_status(id: uuid.UUID):
    appt = session.query(Appointment).filter(Appointment.id == id).first()
    if not appt:
        return {"status_code": 404, "detail": "Appointment tracking pointer index not located."}
    if appt.status != "CANCELLED":
        appt.status = "CANCELLED"
        session.commit()
        session.refresh(appt)
    return appt


def update_appointment_status(id: uuid.UUID):
    appt = session.query(Appointment).filter(Appointment.id == id).first()
    if not appt:
        return {"status_code": 404, "detail": "No Appointment Exists"}
    if appt.status != "CANCELLED":
        appt.status = "CANCELLED"
        session.commit()
        session.refresh(appt)
    return appt

def get_business_config(smb_id):
    config = session.query(SMBBookingConfiguration).filter(
        SMBBookingConfiguration.smb_id == smb_id
    ).first()
    if not config:
        return None
    return config
    
def get_active_appointments(smb_id, business_start_utc, business_end_utc):
    return (
        session.query(Appointment)
        .filter(
            Appointment.smb_id == smb_id,
            Appointment.status == "ACTIVE",
            Appointment.slot_start < business_end_utc,
            Appointment.slot_end > business_start_utc,
        )
        .all()
    )
