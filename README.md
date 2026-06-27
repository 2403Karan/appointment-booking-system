# Appointment Booking System

A timezone-aware Appointment Booking System built with **FastAPI**, **React**, and **TypeScript**. The application allows businesses to configure their working hours and enables customers to book appointments while preventing double bookings through concurrency-safe operations.

## Features
### Business Configuration
- Configure business timezone.
- Set business operating hours.
- Configure appointment slot duration.
- Select active working days.
- Manage holiday exclusions.
- Fetch business configuration using SMB ID.

### Appointment Booking
- Weekly appointment calendar.
- Timezone-aware slot rendering.
- View only available appointment slots.
- Book appointments.
- Cancel booked appointments.
- Prevent double bookings.
- Automatic refresh after booking/cancellation.

### Slot Availability
Available slots are generated based on:
- Business timezone
- Working hours
- Active weekdays
- Holiday exclusions
- Existing appointments
- Past time filtering


## Tech Stack
- React-(TypeScript)
- FastAPI
- SQLAlchemy
- PostgreSQL


## Installation
### Clone Repository
```bash
git clone https://github.com/2403Karan/appointment-booking-system.git
```
```bash
cd appointment-booking-system
```
---
## Backend Setup
```bash
cd backend
```
Create virtual environment
```bash
python -m venv venv
```
Activate
Windows
```bash
venv\Scripts\activate
```
Linux/Mac
```bash
source venv/bin/activate
```
Install dependencies
```bash
pip install -r requirements.txt
```
Run server
```bash
uvicorn app.main:app --reload
```
Backend runs on
```
http://localhost:8000
```
---


## Frontend Setup
```bash
cd frontend
```
Install packages
```bash
npm install
```
Start development server
```bash
npm run dev
```
Frontend runs on
```
http://localhost:5173
```
---

## Environment Variables
Frontend
Create `.env`
```
VITE_API_URL=http://localhost:8000
```
Backend
Create `.env`
```
DATABASE_URL=<database_url>
```