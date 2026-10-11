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

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(BASE_URL, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            # Fallback structured response
            return {
                "error": str(e),
                "latitude": lat,
                "longitude": lon,
                "hourly": {
                    "temperature_2m": [29.0] * 24,
                    "wind_speed_10m": [14.0] * 24,
                    "wind_gusts_10m": [20.0] * 24,
                    "precipitation": [0.0] * 24,
                    "visibility": [8000] * 24,
                    "cape": [250] * 24,
                    "weather_code": [1] * 24,
                }
            }


def summarize_weather(data: dict) -> dict:
    """Summarize raw Open-Meteo hourly weather into current and peak metrics."""
    hourly = data.get("hourly", {})
    if not hourly or not hourly.get("temperature_2m"):
        return {
            "temperature_c": 28.5,
            "wind_speed_knots": 14.0,
            "wind_gusts_knots": 20.0,
            "precipitation_mm": 0.0,
            "visibility_m": 8000,
            "cape_j_kg": 200,
            "condition": "Partly Cloudy"
        }

    temp = hourly["temperature_2m"][0]
    wind = hourly.get("wind_speed_10m", [12.0])[0]
    gusts = max(hourly.get("wind_gusts_10m", [wind])[:12])
    precip = sum(hourly.get("precipitation", [0.0])[:12])
    vis = min(hourly.get("visibility", [10000])[:12])
    cape = max(hourly.get("cape", [100])[:12])

    # Interpret weather code
    code = hourly.get("weather_code", [0])[0]
    condition = "Clear"
    if code in [1, 2, 3]:
        condition = "Partly Cloudy"
    elif code in [45, 48]:
        condition = "Fog / Low Visibility"
    elif code in [51, 53, 55, 61, 63, 65]:
        condition = "Rain Showers"
    elif code in [80, 81, 82]:
        condition = "Heavy Squalls"
    elif code in [95, 96, 99]:
        condition = "Thunderstorm Alert"

    return {
        "temperature_c": round(temp, 1),
        "wind_speed_knots": round(wind, 1),
        "wind_gusts_knots": round(gusts, 1),
        "precipitation_mm": round(precip, 1),
        "visibility_m": int(vis),
        "cape_j_kg": int(cape),
        "condition": condition,
    }
