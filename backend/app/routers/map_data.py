from fastapi import APIRouter
from pydantic import BaseModel
import json
import os
from app.tools.geofence import geofence_engine

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")


class GeofenceCheckRequest(BaseModel):
    latitude: float
    longitude: float


@router.get("/ports")
async def get_indian_ports():
    """Return 15 major Indian fishing harbors as GeoJSON."""
    filepath = os.path.join(DATA_DIR, "indian_ports.geojson")
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}


@router.get("/geojson/{layer_name}")
async def get_geojson(layer_name: str):
    """Serve static GeoJSON boundary files."""
    allowed_layers = [
        "india_eez",
        "andaman_eez",
        "maritime_boundaries",
        "marine_protected_areas",
        "indian_ports",
    ]
    if layer_name not in allowed_layers:
        return {"error": f"Unknown layer: {layer_name}. Available: {allowed_layers}"}

    filepath = os.path.join(DATA_DIR, f"{layer_name}.geojson")
    if not os.path.exists(filepath):
        return {"error": f"GeoJSON file not found: {layer_name}.geojson"}

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/geofence-check")
async def check_geofence(req: GeofenceCheckRequest):
    """Check a specific latitude and longitude against EEZ, MPAs, and IMBL."""
    return geofence_engine.check_location(req.latitude, req.longitude)
