from fastapi import APIRouter, Query, HTTPException ,FastAPI ,Depends
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()
security = HTTPBearer()