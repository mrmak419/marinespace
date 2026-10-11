from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.agents.orchestrator import orca_orchestrator

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@router.post("/")
async def chat(request: ChatRequest):
    """Process a chat message through the ORCA agent system."""
    result = await orca_orchestrator.process_query(
        message=request.message,
        user_lat=request.latitude,
        user_lon=request.longitude
    )
    return result
