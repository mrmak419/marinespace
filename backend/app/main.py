from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="MarineSpace API",
    description="ORCA Marine Intelligence Platform - Backend API",
    version="0.1.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": "MarineSpace API",
        "version": "0.1.0",
        "status": "running",
        "agents": [
            "orchestrator",
            "weather",
            "marine",
            "fishing_zone",
            "safety",
            "geofence",
            "route",
        ],
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Import routers
from app.routers import chat, map_data, alerts

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(map_data.router, prefix="/api/map", tags=["map"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
