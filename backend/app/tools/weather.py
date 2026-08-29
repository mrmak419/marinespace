"""Open-Meteo Weather API client.

Free, no API key needed. 10,000 calls/day.
Docs: https://open-meteo.com/en/docs
"""
import httpx
from typing import Optional

BASE_URL = "https://api.open-meteo.com/v1/forecast"


async def fetch_weather(
    lat: float,
    lon: float,
    forecast_days: int = 3,
) -> dict:
    """Fetch weather forecast for a location."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "precipitation_probability",
            "weather_code",
            "surface_pressure",
            "pressure_msl",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "visibility",
            "cape",
        ]),
        "wind_speed_unit": "kn",
        "timezone": "Asia/Kolkata",
        "forecast_days": forecast_days,
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL, params=params, timeout=15.0)
        response.raise_for_status()
        return response.json()
