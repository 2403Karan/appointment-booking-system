from model import FareAttributes,FareRules,StopsTimes,Stops,Calender,Trips,Routes,Users
from sqlalchemy import select, Insert ,join, text , func, and_, distinct,create_engine
from sqlalchemy.orm import sessionmaker,aliased
import os
from datetime import datetime
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()  

connectionString = ''
Base = declarative_base()
engine = create_engine(connectionString, isolation_level="READ UNCOMMITTED", pool_recycle=3600)
Base.metadata.bind = engine
Base.metadata.create_all(engine)
DBsession = sessionmaker(bind=engine)
session = DBsession()