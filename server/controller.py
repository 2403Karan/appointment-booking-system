from fastapi import APIRouter, Query, HTTPException ,FastAPI ,Depends ,status
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel ,Field
from dotenv import load_dotenv
from pgsql_client import get_business_config, get_available_slots, update_appointment_status ,create_appointment
from datetime import datetime, timedelta
import zoneinfo, uuid, json
from model import AppointmentCreate, AppointmentResponse, AvailableSlotResponse
from uuid import UUID
load_dotenv()
security = HTTPBearer()

router = APIRouter(
    prefix="/api/booking",
    tags=["Booking"]
)
app = FastAPI()

@router.get("/slots", response_model=list[AvailableSlotResponse])
def fetch_avaliable_slots(
    smb_id: UUID = Query(...,)
):
    slots = get_available_slots(smb_id)
    if not slots:
        return []
    return [
        AvailableSlotResponse(
            slot_start=slot["slot_start"],
            slot_end=slot["slot_end"]
        )
        for slot in slots
    ]

@app.post("/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_new_appointment(payload: AppointmentCreate):
    result = create_appointment(payload)
    print("Appointment created:", result)
    return result

@app.patch("/appointments/{id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(id: UUID):
    return update_appointment_status(id)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
