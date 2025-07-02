from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# --- User schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- Document creation ---
class DocumentCreate(BaseModel):
    title: str
    content: str
    visibility: Optional[str] = "private"

# --- Document sharing output ---
class DocumentShareOut(BaseModel):
    user_id: int
    can_edit: bool

    class Config:
        orm_mode = True

# --- Full document output with sharing info (optional) ---
class DocumentOut(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    author_id: int
    shares: Optional[List[DocumentShareOut]] = [] 
    visibility: str 

    class Config:
        orm_mode = True
