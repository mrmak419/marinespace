"""Open-Meteo Marine API client.

Free, no API key needed. 10,000 calls/day.
Docs: https://open-meteo.com/en/docs/marine-weather-api
"""
import httpx

BASE_URL = "https://marine-api.open-meteo.com/v1/marine"


async def fetch_marine_conditions(
    lat: float,
    lon: float,
    forecast_days: int = 3,
) -> dict:
    """Fetch marine/ocean conditions for a location."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join([
            "wave_height",
            "wave_direction",
            "wave_period",
            "wind_wave_height",
            "wind_wave_direction",
            "swell_wave_height",
            "swell_wave_direction",
            "swell_wave_period",
            "ocean_current_velocity",
            "ocean_current_direction",
            "sea_surface_temperature",
        ]),
        "timezone": "Asia/Kolkata",
        "forecast_days": forecast_days,
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(BASE_URL, params=params, timeout=15.0)
        response.raise_for_status()
        return response.json()
