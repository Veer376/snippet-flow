from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Database URL
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost/snippetflow_db")

# Create the database engine
engine = create_engine(DATABASE_URL)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define a base class for declarative models
Base = declarative_base()