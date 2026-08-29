"""LangGraph state schema for the ORCA agent system."""
from typing import TypedDict, Optional, Annotated
from operator import add


class AgentState(TypedDict):
    """State that flows through the LangGraph agent graph."""
    # User input
    user_message: str
    session_id: str
    user_location: Optional[dict]  # {lat, lon}
    
    # Detected intent
    intent: Optional[str]
    required_agents: list[str]
    
    # Agent outputs (accumulated)
    weather_data: Optional[dict]
    marine_data: Optional[dict]
    fishing_data: Optional[dict]
    safety_data: Optional[dict]
    geofence_data: Optional[dict]
    route_data: Optional[dict]
    
    # Final output
    response: Optional[str]
    map_actions: list[dict]  # Instructions for frontend map
    sources: list[str]
    
    # Conversation history
    messages: list[dict]
