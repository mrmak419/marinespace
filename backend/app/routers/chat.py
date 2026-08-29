from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []
    map_data: Optional[dict] = None
    safety_score: Optional[str] = None


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message through the ORCA agent system."""
    # TODO: Connect to LangGraph agent orchestrator in Phase 3
    return ChatResponse(
        response=f"Received: '{request.message}'. Agent system not connected yet (Phase 3).",
        sources=["system"],
    )


@router.get("/stream")
async def chat_stream():
    """SSE endpoint for streaming chat responses."""
    # TODO: Implement SSE streaming in Phase 3
    return {"message": "SSE streaming endpoint - coming in Phase 3"}
