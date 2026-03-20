from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
import uuid
import httpx

from models import (
    User, Pet, PetCreate, DailyLog, DailyLogCreate, 
    WeeklySummary, Reminder, ReminderCreate, SessionData,
    LoginRequest, RegisterRequest
)
from auth import get_current_user, hash_password, verify_password, create_jwt_token
from ai_insights import generate_weekly_summary

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

@api_router.post("/auth/register")
async def register(request: RegisterRequest):
    existing = await db.users.find_one({"email": request.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pwd = hash_password(request.password)
    
    user_doc = {
        "user_id": user_id,
        "email": request.email,
        "name": request.name,
        "picture": None,
        "password_hash": hashed_pwd,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token(user_id)
    
    user_response = {
        "user_id": user_id,
        "email": request.email,
        "name": request.name,
        "picture": None,
        "created_at": user_doc["created_at"]
    }
    
    return {"user": user_response, "token": token}

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"])
    
    user_response = {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "created_at": user["created_at"]
    }
    
    return {"user": user_response, "token": token}

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get('session_id')
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as client_http:
        try:
            resp = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            resp.raise_for_status()
            session_data = resp.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch session data: {str(e)}")
    
    email = session_data.get('email')
    name = session_data.get('name')
    picture = session_data.get('picture')
    session_token = session_data.get('session_token')
    
    if not email or not session_token:
        raise HTTPException(status_code=400, detail="Invalid session data")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user:
        if name and user.get('name') != name:
            await db.users.update_one(
                {"email": email},
                {"$set": {"name": name, "picture": picture}}
            )
            user['name'] = name
            user['picture'] = picture
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user)
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "session_token": session_token,
        "user_id": user["user_id"],
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "created_at": user["created_at"]
    }

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request, db)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/pets")
async def get_pets(request: Request):
    user = await get_current_user(request, db)
    pets = await db.pets.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return pets

@api_router.post("/pets")
async def create_pet(request: Request, pet_data: PetCreate):
    user = await get_current_user(request, db)
    
    pet_id = f"pet_{uuid.uuid4().hex[:12]}"
    pet_doc = {
        "pet_id": pet_id,
        "user_id": user["user_id"],
        **pet_data.model_dump(),
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.pets.insert_one(pet_doc)
    # Return document without MongoDB _id field
    created_pet = await db.pets.find_one({"pet_id": pet_id}, {"_id": 0})
    return created_pet

@api_router.get("/pets/{pet_id}")
async def get_pet(request: Request, pet_id: str):
    user = await get_current_user(request, db)
    pet = await db.pets.find_one(
        {"pet_id": pet_id, "user_id": user["user_id"]},
        {"_id": 0}
    )
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@api_router.put("/pets/{pet_id}")
async def update_pet(request: Request, pet_id: str, pet_data: PetCreate):
    user = await get_current_user(request, db)
    
    result = await db.pets.update_one(
        {"pet_id": pet_id, "user_id": user["user_id"]},
        {"$set": pet_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    pet = await db.pets.find_one({"pet_id": pet_id}, {"_id": 0})
    return pet

@api_router.get("/logs")
async def get_logs(request: Request, pet_id: str = None):
    user = await get_current_user(request, db)
    
    query = {"user_id": user["user_id"]}
    if pet_id:
        query["pet_id"] = pet_id
    
    logs = await db.daily_logs.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    return logs

@api_router.get("/logs/today")
async def get_today_log(request: Request, pet_id: str):
    user = await get_current_user(request, db)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    log = await db.daily_logs.find_one(
        {"user_id": user["user_id"], "pet_id": pet_id, "date": today},
        {"_id": 0}
    )
    return log

@api_router.post("/logs")
async def create_log(request: Request, log_data: DailyLogCreate):
    user = await get_current_user(request, db)
    
    existing = await db.daily_logs.find_one(
        {"user_id": user["user_id"], "pet_id": log_data.pet_id, "date": log_data.date},
        {"_id": 0}
    )
    
    if existing:
        await db.daily_logs.update_one(
            {"user_id": user["user_id"], "pet_id": log_data.pet_id, "date": log_data.date},
            {"$set": log_data.model_dump()}
        )
        updated = await db.daily_logs.find_one(
            {"user_id": user["user_id"], "pet_id": log_data.pet_id, "date": log_data.date},
            {"_id": 0}
        )
        return updated
    
    log_id = f"log_{uuid.uuid4().hex[:12]}"
    log_doc = {
        "log_id": log_id,
        "user_id": user["user_id"],
        **log_data.model_dump(),
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.daily_logs.insert_one(log_doc)
    # Return document without MongoDB _id field
    created_log = await db.daily_logs.find_one({"log_id": log_id}, {"_id": 0})
    return created_log

@api_router.get("/summaries")
async def get_summaries(request: Request, pet_id: str = None):
    user = await get_current_user(request, db)
    
    query = {"user_id": user["user_id"]}
    if pet_id:
        query["pet_id"] = pet_id
    
    summaries = await db.weekly_summaries.find(query, {"_id": 0}).sort("week_start", -1).to_list(100)
    return summaries

@api_router.post("/summaries/generate")
async def generate_summary(request: Request, pet_id: str):
    user = await get_current_user(request, db)
    
    pet = await db.pets.find_one({"pet_id": pet_id, "user_id": user["user_id"]}, {"_id": 0})
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    today = datetime.now(timezone.utc)
    week_start = (today - timedelta(days=today.weekday())).strftime("%Y-%m-%d")
    week_end = (today + timedelta(days=6-today.weekday())).strftime("%Y-%m-%d")
    
    logs = await db.daily_logs.find(
        {"user_id": user["user_id"], "pet_id": pet_id, "date": {"$gte": week_start, "$lte": week_end}},
        {"_id": 0}
    ).sort("date", 1).to_list(100)
    
    if len(logs) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 days of logs to generate summary")
    
    prev_week_start = (today - timedelta(days=today.weekday()+7)).strftime("%Y-%m-%d")
    prev_week_end = (today - timedelta(days=today.weekday()+1)).strftime("%Y-%m-%d")
    prev_logs = await db.daily_logs.find(
        {"user_id": user["user_id"], "pet_id": pet_id, "date": {"$gte": prev_week_start, "$lt": prev_week_end}},
        {"_id": 0}
    ).sort("date", 1).to_list(100)
    
    insight = await generate_weekly_summary(pet["name"], logs, prev_logs if prev_logs else None)
    
    summary_id = f"summary_{uuid.uuid4().hex[:12]}"
    summary_doc = {
        "summary_id": summary_id,
        "user_id": user["user_id"],
        "pet_id": pet_id,
        "week_start": week_start,
        "week_end": week_end,
        "summary_text": insight["summary_text"],
        "key_patterns": insight["key_patterns"],
        "concerns": insight["concerns"],
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.weekly_summaries.insert_one(summary_doc)
    # Return document without MongoDB _id field
    created_summary = await db.weekly_summaries.find_one({"summary_id": summary_id}, {"_id": 0})
    return created_summary

@api_router.get("/reminders")
async def get_reminders(request: Request):
    user = await get_current_user(request, db)
    reminders = await db.reminders.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("scheduled_for", 1).to_list(100)
    return reminders

@api_router.post("/reminders")
async def create_reminder(request: Request, reminder_data: ReminderCreate):
    user = await get_current_user(request, db)
    
    reminder_id = f"reminder_{uuid.uuid4().hex[:12]}"
    reminder_doc = {
        "reminder_id": reminder_id,
        "user_id": user["user_id"],
        **reminder_data.model_dump(),
        "is_completed": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.reminders.insert_one(reminder_doc)
    # Return document without MongoDB _id field
    created_reminder = await db.reminders.find_one({"reminder_id": reminder_id}, {"_id": 0})
    return created_reminder

@api_router.patch("/reminders/{reminder_id}")
async def update_reminder(request: Request, reminder_id: str):
    user = await get_current_user(request, db)
    body = await request.json()
    
    result = await db.reminders.update_one(
        {"reminder_id": reminder_id, "user_id": user["user_id"]},
        {"$set": body}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder = await db.reminders.find_one({"reminder_id": reminder_id}, {"_id": 0})
    return reminder

@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(request: Request, reminder_id: str):
    user = await get_current_user(request, db)
    
    result = await db.reminders.delete_one(
        {"reminder_id": reminder_id, "user_id": user["user_id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    return {"message": "Reminder deleted"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
