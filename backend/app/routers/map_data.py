from fastapi import APIRouter
from fastapi.responses import FileResponse
import json
import os

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")


@router.get("/geojson/{layer_name}")
async def get_geojson(layer_name: str):
    """Serve static GeoJSON boundary files."""
    allowed_layers = [
        "india_eez",
        "andaman_eez",
        "maritime_boundaries",
        "marine_protected_areas",
        "india_coastline",
        "indian_ports",
    ]
    if layer_name not in allowed_layers:
        return {"error": f"Unknown layer: {layer_name}. Available: {allowed_layers}"}
    
    filepath = os.path.join(DATA_DIR, f"{layer_name}.geojson")
    if not os.path.exists(filepath):
        return {"error": f"GeoJSON file not found: {layer_name}.geojson. Download it first."}
    
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/pfz")
async def get_pfz_zones():
    """Get current Potential Fishing Zones."""
    # TODO: Implement PFZ fetcher in Phase 2
    return {"message": "PFZ endpoint - coming in Phase 2", "zones": []}


@router.get("/weather-overlay")
async def get_weather_overlay(lat: float, lon: float):
    """Get weather data for map overlay."""
    # TODO: Implement in Phase 2
    return {"message": "Weather overlay - coming in Phase 2"}
