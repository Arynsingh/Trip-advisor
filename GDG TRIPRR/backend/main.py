from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# Allow CORS so React frontend can connect
origins = [
    "http://localhost:3000",  # React dev server
    # add your deployed frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with DB in production)
user_preferences = {}
user_itineraries = {}
group_members = []

# ----------------- MODELS -----------------
class Preferences(BaseModel):
    preferences: Dict[str, bool]
    budget: str

class ItineraryRequest(BaseModel):
    preferences: Dict[str, bool]
    budget: str

class ChatRequest(BaseModel):
    message: str

class GroupMember(BaseModel):
    name: str
    preferences: Dict[str, bool]

# ----------------- ROUTES -----------------

@app.get("/api/ping")
async def ping():
    return {"message": "Backend is working!"}

# Save user preferences
@app.post("/api/preferences/{user_id}")
async def save_preferences(user_id: str, prefs: Preferences):
    user_preferences[user_id] = prefs.dict()
    return {"success": True, "message": "Preferences saved"}

# Get user preferences
@app.get("/api/preferences/{user_id}")
async def get_preferences(user_id: str):
    return user_preferences.get(user_id, {"preferences": {}, "budget": "moderate"})

# Generate itinerary
@app.post("/api/itinerary/generate")
async def generate_itinerary(req: ItineraryRequest):
    prefs = req.preferences
    budget = req.budget
    # Mock itinerary: 3 days
    itinerary = [
        {
            "day": 1,
            "activities": [
                {"time": "09:00", "activity": "Visit Museum", "duration": "2h", "cost": "$20", "crowdLevel": "Low"},
                {"time": "12:00", "activity": "Lunch at Local Cafe", "duration": "1h", "cost": "$15", "crowdLevel": "Medium"},
            ],
        },
        {
            "day": 2,
            "activities": [
                {"time": "10:00", "activity": "City Tour", "duration": "3h", "cost": "$50", "crowdLevel": "High"},
                {"time": "14:00", "activity": "Shopping", "duration": "2h", "cost": "$100", "crowdLevel": "Medium"},
            ],
        },
        {
            "day": 3,
            "activities": [
                {"time": "09:00", "activity": "Hiking Adventure", "duration": "4h", "cost": "$0", "crowdLevel": "Low"},
                {"time": "14:00", "activity": "Dinner at Restaurant", "duration": "2h", "cost": "$40", "crowdLevel": "High"},
            ],
        },
    ]
    return {"success": True, "data": {"itinerary": itinerary}}

# Chat endpoint (mock AI)
@app.post("/api/chat")
async def chat(req: ChatRequest):
    message = req.message.lower()
    # Mock responses
    if "eat" in message:
        response = "I recommend trying the local bistro for authentic cuisine!"
    elif "pharmacy" in message:
        response = "The nearest pharmacy is 200m from your location."
    elif "events" in message or "happening" in message:
        response = "There is a local festival happening downtown today!"
    else:
        response = "I'm here to help with your trip! Ask me anything."

    return {"success": True, "data": {"text": response}}

# Add group member
@app.post("/api/group/add")
async def add_member(member: GroupMember):
    group_members.append(member.dict())
    return {"success": True, "message": "Member added", "members": group_members}

# List group members
@app.get("/api/group")
async def list_group_members():
    return group_members
