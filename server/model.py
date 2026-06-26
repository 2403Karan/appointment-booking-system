from sqlalchemy.ext.declarative import declarative_base
import uuid
from sqlalchemy import Column, String, Integer, Time, ForeignKey, CheckConstraint, Index ,UUID
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, TIMESTAMP
from pydantic import BaseModel, Field
from datetime import datetime
Base = declarative_base()

class SMBBookingConfiguration(Base):
    __tablename__ = "smb_booking_configurations"

    smb_id = Column(UUID, primary_key=True, default=uuid.uuid4)
    timezone = Column(String(50), nullable=False)                 
    duration = Column(Integer, nullable=False)                    
    start_time = Column(Time, nullable=False)                     
    end_time = Column(Time, nullable=False)                       
    days = Column(ARRAY(Integer), nullable=False)                 
    excluded_days = Column(JSONB, nullable=False, default=list)    


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    smb_id = Column(UUID, ForeignKey("smb_booking_configurations.smb_id", ondelete="CASCADE"), nullable=False)
    lead_id = Column(UUID, nullable=False, default=uuid.uuid4) 
    status = Column(String(20), nullable=False, default="ACTIVE")
    slot_start = Column(TIMESTAMP(timezone=True), nullable=False) 
    slot_end = Column(TIMESTAMP(timezone=True), nullable=False)  
    lead_name = Column(String(255), nullable=False)               

    __table_args__ = (
        CheckConstraint("status IN ('ACTIVE', 'CANCELLED')", name="chk_status"),
        CheckConstraint("slot_start < slot_end", name="chk_slot_times"),
        Index("idx_prevent_double_booking", "smb_id", "slot_start", unique=True, postgresql_where=(status == "ACTIVE")),
    )
    
class AppointmentCreate(BaseModel):
    smb_id: uuid.UUID
    slot_start: datetime
    slot_end: datetime
    lead_name: str = Field(..., max_length=255)

class AppointmentResponse(BaseModel):
    id: uuid.UUID
    smb_id: uuid.UUID
    lead_id: uuid.UUID
    status: str
    slot_start: datetime
    slot_end: datetime
    lead_name: str
    class Config:
        from_attributes = True

class AvailableSlotResponse(BaseModel):
    slot_start: datetime
    slot_end: datetime