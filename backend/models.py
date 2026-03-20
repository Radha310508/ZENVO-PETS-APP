from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    session_token: str
    user_id: str
    expires_at: datetime
    created_at: datetime

class Pet(BaseModel):
    pet_id: str
    user_id: str
    name: str
    breed: str
    age: int
    weight: float
    food_info: Optional[str] = None
    vaccination_schedule: Optional[str] = None
    health_notes: Optional[str] = None
    created_at: datetime

class PetCreate(BaseModel):
    name: str
    breed: str
    age: int
    weight: float
    food_info: Optional[str] = None
    vaccination_schedule: Optional[str] = None
    health_notes: Optional[str] = None

class DailyLog(BaseModel):
    log_id: str
    user_id: str
    pet_id: str
    date: str
    appetite: str
    energy: str
    mood: str
    sleep: str
    unusual_behavior: Optional[str] = None
    triggers: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

class DailyLogCreate(BaseModel):
    pet_id: str
    date: str
    appetite: str
    energy: str
    mood: str
    sleep: str
    unusual_behavior: Optional[str] = None
    triggers: Optional[str] = None
    notes: Optional[str] = None

class WeeklySummary(BaseModel):
    summary_id: str
    user_id: str
    pet_id: str
    week_start: str
    week_end: str
    summary_text: str
    key_patterns: List[str]
    concerns: List[str]
    created_at: datetime

class Reminder(BaseModel):
    reminder_id: str
    user_id: str
    pet_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    reminder_type: str
    scheduled_for: datetime
    is_completed: bool = False
    created_at: datetime

class ReminderCreate(BaseModel):
    pet_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    reminder_type: str
    scheduled_for: datetime

class SessionData(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str