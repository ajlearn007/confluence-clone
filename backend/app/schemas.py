from pydantic import BaseModel, EmailStr
from datetime import datetime


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

class DocumentCreate(BaseModel):
    title: str
    content: str

class DocumentOut(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    
    class Config:
        orm_mode = True
