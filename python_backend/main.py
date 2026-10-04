from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
from dotenv import load_dotenv

from database import init_db, get_db_connection
from agents.orchestrator import AgentOrchestrator

load_dotenv()

app = FastAPI(title="ConciergeIQ Python AI Agent Service")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AgentOrchestrator()

@app.on_event("startup")
def on_startup():
    init_db()

# --- Pydantic Data Models ---
class ChatRequest(BaseModel):
    message: str
    currentLocation: Optional[str] = "Rajamahendravaram"

class ScheduleItem(BaseModel):
    dayNumber: int
    scheduledTime: str
    activityName: str
    activityType: str
    activityId: Optional[int] = None
    status: Optional[str] = "PLANNED"

class ItineraryProposal(BaseModel):
    title: str
    destination: str
    startDate: Optional[str] = "2026-10-02"
    endDate: Optional[str] = "2026-10-03"
    activities: List[dict]

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    fullName: str

class GoogleLoginRequest(BaseModel):
    email: Optional[str] = "traveler.google@example.com"
    name: Optional[str] = "Google Guest"
    googleToken: Optional[str] = None

class MobileLoginRequest(BaseModel):
    phone: str
    otp: Optional[str] = "123456"

# --- Endpoints ---

@app.get("/")
def root():
    return {"status": "online", "service": "ConciergeIQ Python AI Agent Server", "database": "SQLite"}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (req.email, req.password))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        # Auto-create if first time
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)", (req.email, req.password, "Demo User"))
        user_id = c.lastrowid
        conn.commit()
        conn.close()
        return {
            "token": f"bearer-token-{user_id}",
            "refreshToken": f"refresh-token-{user_id}",
            "id": user_id,
            "email": req.email,
            "fullName": "Demo User",
            "role": "GUEST"
        }
    
    return {
        "token": f"bearer-token-{user['id']}",
        "refreshToken": f"refresh-token-{user['id']}",
        "id": user["id"],
        "email": user["email"],
        "fullName": user["full_name"],
        "role": "GUEST"
    }

@app.post("/api/auth/register")
@app.post("/api/auth/signup")
def register(req: RegisterRequest):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)", (req.email, req.password, req.fullName))
        user_id = c.lastrowid
        conn.commit()
        conn.close()
        return {
            "token": f"bearer-token-{user_id}",
            "refreshToken": f"refresh-token-{user_id}",
            "id": user_id,
            "email": req.email,
            "fullName": req.fullName,
            "role": "GUEST"
        }
    except Exception:
        conn.close()
        # Return successful session even on existing user
        return {
            "token": "bearer-token-1",
            "refreshToken": "refresh-token-1",
            "id": 1,
            "email": req.email,
            "fullName": req.fullName,
            "role": "GUEST"
        }

@app.post("/api/auth/google-login")
def google_login(req: GoogleLoginRequest):
    target_email = req.email or "traveler.google@example.com"
    target_name = req.name or "Google Guest"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (target_email,))
    user = cursor.fetchone()
    
    if not user:
        cursor.execute("INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)", (target_email, "google-oauth-pass", target_name))
        user_id = cursor.lastrowid
        conn.commit()
    else:
        user_id = user["id"]
        target_name = user["full_name"]
    
    conn.close()
    
    token = f"google-bearer-token-{user_id}"
    return {
        "token": token,
        "refreshToken": f"google-refresh-token-{user_id}",
        "id": user_id,
        "email": target_email,
        "fullName": target_name,
        "role": "GUEST"
    }

@app.post("/api/auth/mobile-login")
def mobile_login(req: MobileLoginRequest):
    phone_email = f"{req.phone}@mobile.conciergeiq.com"
    target_name = f"Mobile User ({req.phone})"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (phone_email,))
    user = cursor.fetchone()
    
    if not user:
        cursor.execute("INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)", (phone_email, "mobile-otp-pass", target_name))
        user_id = cursor.lastrowid
        conn.commit()
    else:
        user_id = user["id"]
        target_name = user["full_name"]
    
    conn.close()
    
    token = f"mobile-bearer-token-{user_id}"
    return {
        "token": token,
        "refreshToken": f"mobile-refresh-token-{user_id}",
        "id": user_id,
        "email": phone_email,
        "fullName": target_name,
        "role": "GUEST"
    }

@app.get("/api/profile/preferences")
def get_preferences():
    return {
        "language": "en",
        "currency": "INR",
        "theme": "dark",
        "notifications": True
    }

@app.put("/api/profile/preferences")
def update_preferences(prefs: dict):
    return prefs

@app.post("/api/chat")
def process_chat(req: ChatRequest):
    user_id = 1
    state = orchestrator.run_workflow(req.message, req.currentLocation, user_id)
    
    # Save User message and AI Assistant response to SQLite
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)", (user_id, "USER", req.message))
    c.execute("INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)", (user_id, "ASSISTANT", state["response_message"]))
    conn.commit()
    conn.close()

    return {
        "responseMessage": state["response_message"],
        "recommendations": state.get("recommendations", []),
        "proposedItinerary": {
            "title": state.get("trip_title", "Custom Trip"),
            "destination": state.get("location", "Rajamahendravaram"),
            "startDate": "2026-10-02",
            "endDate": "2026-10-03",
            "activities": state.get("activities", [])
        },
        "agentLogs": state.get("logs", [])
    }

@app.get("/api/chat/history")
def get_chat_history():
    user_id = 1
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT role, message FROM chat_history WHERE user_id = ? ORDER BY id ASC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"role": r["role"], "message": r["message"]} for r in rows]

@app.post("/api/chat/itinerary/approve")
def approve_itinerary(proposal: ItineraryProposal):
    user_id = 1
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO trips (user_id, title, destination, start_date, end_date, budget_limit) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, proposal.title, proposal.destination, proposal.startDate, proposal.endDate, 1000)
    )
    trip_id = c.lastrowid

    for idx, act in enumerate(proposal.activities, 1):
        c.execute(
            "INSERT INTO schedules (trip_id, day_number, scheduled_time, activity_name, activity_type, activity_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (trip_id, 1, act.get("time", "10:00 AM"), act.get("name", "Activity"), act.get("type", "ATTRACTION"), act.get("activityId", idx), act.get("status", "PLANNED"))
        )

    conn.commit()
    conn.close()
    return {"message": f"Itinerary approved and booked. Trip ID: {trip_id}"}

@app.get("/api/trips")
def get_all_trips():
    user_id = 1
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM trips WHERE user_id = ? ORDER BY id DESC", (user_id,))
    trip_rows = c.fetchall()

    trips = []
    for t in trip_rows:
        t_id = t["id"]
        c.execute("SELECT * FROM schedules WHERE trip_id = ? ORDER BY id ASC", (t_id,))
        s_rows = c.fetchall()
        schedules = [
            {
                "id": s["id"],
                "dayNumber": s["day_number"],
                "scheduledTime": s["scheduled_time"],
                "activityName": s["activity_name"],
                "activityType": s["activity_type"],
                "activityId": s["activity_id"],
                "status": s["status"]
            }
            for s in s_rows
        ]
        trips.append({
            "id": t["id"],
            "title": t["title"],
            "destination": t["destination"],
            "startDate": t["start_date"],
            "endDate": t["end_date"],
            "budgetLimit": t["budget_limit"],
            "budgetSpent": t["budget_spent"],
            "schedules": schedules
        })

    conn.close()
    return trips

@app.get("/api/trips/{trip_id}")
def get_trip(trip_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM trips WHERE id = ?", (trip_id,))
    t = c.fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Trip not found")

    c.execute("SELECT * FROM schedules WHERE trip_id = ? ORDER BY id ASC", (trip_id,))
    s_rows = c.fetchall()
    schedules = [
        {
            "id": s["id"],
            "dayNumber": s["day_number"],
            "scheduledTime": s["scheduled_time"],
            "activityName": s["activity_name"],
            "activityType": s["activity_type"],
            "activityId": s["activity_id"],
            "status": s["status"]
        }
        for s in s_rows
    ]
    conn.close()
    return {
        "id": t["id"],
        "title": t["title"],
        "destination": t["destination"],
        "startDate": t["start_date"],
        "endDate": t["end_date"],
        "budgetLimit": t["budget_limit"],
        "budgetSpent": t["budget_spent"],
        "schedules": schedules
    }

@app.patch("/api/trips/{trip_id}/schedules/{schedule_id}/status")
def update_schedule_status(trip_id: int, schedule_id: int, status: str = Query(...)):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE schedules SET status = ? WHERE id = ? AND trip_id = ?", (status, schedule_id, trip_id))
    conn.commit()

    c.execute("SELECT * FROM schedules WHERE id = ?", (schedule_id,))
    s = c.fetchone()
    conn.close()
    if not s:
        raise HTTPException(status_code=404, detail="Schedule not found")

    return {
        "id": s["id"],
        "dayNumber": s["day_number"],
        "scheduledTime": s["scheduled_time"],
        "activityName": s["activity_name"],
        "activityType": s["activity_type"],
        "activityId": s["activity_id"],
        "status": s["status"]
    }

@app.post("/api/trips/{trip_id}/schedules")
def add_schedule_item(trip_id: int, item: ScheduleItem):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO schedules (trip_id, day_number, scheduled_time, activity_name, activity_type, activity_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (trip_id, item.dayNumber, item.scheduledTime, item.activityName, item.activityType, item.activityId, item.status or "PLANNED")
    )
    s_id = c.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": s_id,
        "dayNumber": item.dayNumber,
        "scheduledTime": item.scheduledTime,
        "activityName": item.activityName,
        "activityType": item.activityType,
        "activityId": item.activityId,
        "status": item.status or "PLANNED"
    }

@app.delete("/api/trips/{trip_id}/schedules/{schedule_id}")
def remove_schedule_item(trip_id: int, schedule_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM schedules WHERE id = ? AND trip_id = ?", (schedule_id, trip_id))
    conn.commit()
    conn.close()
    return {"message": "Schedule item removed successfully"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Python AI Agent Server on http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
