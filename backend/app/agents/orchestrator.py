"""Orchestrator Agent - The brain of ORCA.

Coordinates all specialist agents and tools, executes spatial & sea-state checks,
and synthesizes natural-language recommendations using Google Gemini.
"""
import asyncio
from typing import Optional
from app.tools.weather import fetch_weather, summarize_weather
from app.tools.marine import fetch_marine_conditions, summarize_marine
from app.tools.geofence import geofence_engine
from app.tools.alerts import fetch_all_alerts
from app.tools.pfz import get_pfz_advisories
from app.tools.tides import get_tide_forecast
from app.agents.safety_agent import evaluate_safety
from app.agents.gemini_client import generate_response

# Port coordinate lookup for natural language queries
KNOWN_LOCATIONS = {
    "vizag": (17.6900, 83.3000, "Visakhapatnam"),
    "visakhapatnam": (17.6900, 83.3000, "Visakhapatnam"),
    "chennai": (13.1250, 80.2940, "Chennai"),
    "kasimedu": (13.1250, 80.2940, "Kasimedu, Chennai"),
    "kochi": (9.9650, 76.2420, "Kochi"),
    "cochin": (9.9650, 76.2420, "Kochi"),
    "mumbai": (18.9140, 72.8250, "Mumbai"),
    "sassoon": (18.9140, 72.8250, "Sassoon Docks, Mumbai"),
    "mangalore": (12.8620, 74.8350, "Mangalore"),
    "paradip": (20.3120, 86.6110, "Paradip"),
    "veraval": (20.9030, 70.3620, "Veraval"),
    "porbandar": (21.6420, 69.6010, "Porbandar"),
    "tuticorin": (8.7950, 78.1610, "Thoothukudi"),
    "thoothukudi": (8.7950, 78.1610, "Thoothukudi"),
    "kakinada": (16.9830, 82.2610, "Kakinada"),
    "digha": (21.6250, 87.5140, "Digha"),
    "port blair": (11.6620, 92.7420, "Port Blair"),
    "andaman": (11.6620, 92.7420, "Andaman"),
    "kerala": (9.9650, 76.2420, "Kerala Coast"),
    "gujarat": (20.9030, 70.3620, "Gujarat Coast"),
    "bengal": (21.6250, 87.5140, "West Bengal Coast"),
    "odisha": (20.3120, 86.6110, "Odisha Coast"),
}


def resolve_location(message: str, user_lat: Optional[float], user_lon: Optional[float]) -> tuple[float, float, str]:
    """Detect location from query text or fallback to coordinates / default."""
    msg_lower = message.lower()
    for key, (lat, lon, name) in KNOWN_LOCATIONS.items():
        if key in msg_lower:
            return lat, lon, name

    if user_lat is not None and user_lon is not None:
        return user_lat, user_lon, "Current Location"

    # Default to center of peninsular Indian fishing waters (Visakhapatnam sector)
    return 17.6900, 83.3000, "Visakhapatnam Waters"


class Orchestrator:
    async def process_query(
        self,
        message: str,
        user_lat: Optional[float] = None,
        user_lon: Optional[float] = None
    ) -> dict:
        """Execute full multi-agent reasoning chain."""
        lat, lon, loc_name = resolve_location(message, user_lat, user_lon)

        # 1. Concurrently fetch all live sensor and boundary datasets
        weather_raw, marine_raw, alerts = await asyncio.gather(
            fetch_weather(lat, lon),
            fetch_marine_conditions(lat, lon),
            fetch_all_alerts(lat, lon)
        )

        weather_summary = summarize_weather(weather_raw)
        marine_summary = summarize_marine(marine_raw)
        geofence_info = geofence_engine.check_location(lat, lon)
        pfz_zones = get_pfz_advisories(lat, lon)
        tide_info = get_tide_forecast(lat, lon)

        # 2. Deterministic Safety Evaluation (Zero LLM hallucination in safety math)
        safety_eval = evaluate_safety(weather_summary, marine_summary, geofence_info, alerts)

        # 3. Formulate factual context for Gemini
        facts_context = f"""
TARGET LOCATION: {loc_name} (Lat: {lat}, Lon: {lon})
SAFETY STATUS: {safety_eval['level']} (Risk Score: {safety_eval['score']}/100)
WAVE HEIGHT: {marine_summary['wave_height_m']}m (12h peak: {marine_summary['max_wave_12h_m']}m) - Sea state: {marine_summary['sea_state']}
WIND SPEED: {weather_summary['wind_speed_knots']} knots (Gusts: {weather_summary['wind_gusts_knots']} knots)
WEATHER: {weather_summary['condition']}, Temp: {weather_summary['temperature_c']}°C, Precip: {weather_summary['precipitation_mm']}mm
SST: {marine_summary['sst_c']}°C | SURFACE CURRENT: {marine_summary['current_knots']} knots
TIDES: {tide_info['current_tide']} (Height: {tide_info['current_height_m']}m) | Next High: {tide_info['next_high_tide']}
GEOFENCE: In Indian EEZ: {geofence_info['in_indian_eez']} | MPA Warning: {geofence_info['in_mpa']} | Distance to IMBL: {geofence_info['imbl_distance_nm']} NM
NEAREST PORT: {geofence_info.get('nearest_port', {}).get('name', loc_name)} ({geofence_info.get('nearest_port', {}).get('distance_km', 'N/A')} km)
ACTIVE ALERTS: {len(alerts)} alerts active. Sample: {alerts[0]['title'] if alerts else 'None'}
NEAREST PFZ: {pfz_zones[0]['zone_name'] if pfz_zones else 'Standard coastal waters'} ({pfz_zones[0]['distance_km'] if pfz_zones else ''} km, Target: {', '.join(pfz_zones[0].get('target_species', [])) if pfz_zones else 'Mixed pelagics'})
SAFETY REASONS: {'; '.join(safety_eval['reasons'])}
RECOMMENDATIONS: {'; '.join(safety_eval['recommendations'])}
"""

        system_instruction = (
            "You are ORCA, an intelligent and authoritative AI Marine Intelligence Assistant for Indian fishermen and maritime authorities. "
            "Your recommendations must be thorough, clear, and complete. NEVER cut off mid-sentence. "
            "Always follow this exact structure: "
            "1. Clear Verdict: State the safety verdict clearly with an icon (🟢 SAFE / 🟡 EXERCISE CAUTION / 🔴 DANGEROUS - DO NOT VENTURE). "
            "2. Critical Hazards & Warnings: Specifically mention any high waves, severe wind gusts, thunderstorm (CAPE) risk, IMBL boundary proximity, or active government alerts. If conditions are calm, explicitly note that. "
            "3. Sea State Summary: Bullet points with wave height, wind speed, surface currents, SST, and tide cycle. "
            "4. Practical Action Plan: Clear advice on vessel suitability, departure timing, and fishing grounds. "
            "5. Authoritative Sources: Cite INCOIS, IMD, or Open-Meteo."
        )

        user_prompt = (
            f"User query: \"{message}\"\n\n"
            f"Real-time sensor and boundary data:\n{facts_context}\n\n"
            "Provide the complete, detailed safety and marine advisory now. Make sure to clearly explain every hazard."
        )

        llm_response = await generate_response(user_prompt, system_instruction=system_instruction)

        # Fallback if LLM key is absent or unreachable
        if not llm_response or len(llm_response.strip()) < 50 or "Gemini API error" in llm_response:
            verdict_icon = "🟢" if safety_eval['level'] == "SAFE" else ("🟡" if safety_eval['level'] == "CAUTION" else "🔴")
            reasons_formatted = "\n".join([f"• {r}" for r in safety_eval["reasons"]])
            recs_formatted = "\n".join([f"• {r}" for r in safety_eval["recommendations"]])

            llm_response = f"""### {verdict_icon} Verdict: {safety_eval['level']} (Safety Score: {safety_eval['score']}/100)

**Observed Conditions off {loc_name}:**
• **Wave Height:** {marine_summary['wave_height_m']}m (Peak: {marine_summary['max_wave_12h_m']}m) — {marine_summary['sea_state']}
• **Winds & Gusts:** {weather_summary['wind_speed_knots']} knots (Gusts up to {weather_summary['wind_gusts_knots']} knots)
• **Weather & Rain:** {weather_summary['condition']}, {weather_summary['temperature_c']}°C (Rain: {weather_summary['precipitation_mm']}mm)
• **Tides:** {tide_info['current_tide']} ({tide_info['current_height_m']}m)
• **Boundary Status:** {'Within Indian EEZ' if geofence_info['in_indian_eez'] else 'Check boundary'} (Distance to IMBL: {geofence_info['imbl_distance_nm']} NM)

**Identified Hazards & Warnings:**
{reasons_formatted}

**Recommended Action Plan:**
{recs_formatted}

*Authoritative Data Sources: INCOIS Ocean State Forecast, Open-Meteo Marine, IMD RSMC, NDMA SACHET.*"""

        return {
            "response": llm_response,
            "location": loc_name,
            "coordinates": {"latitude": lat, "longitude": lon},
            "safety_assessment": safety_eval,
            "metrics": {
                "wave_height_m": marine_summary["wave_height_m"],
                "wind_speed_knots": weather_summary["wind_speed_knots"],
                "wind_gusts_knots": weather_summary["wind_gusts_knots"],
                "sst_c": marine_summary["sst_c"],
                "sea_state": marine_summary["sea_state"],
                "condition": weather_summary["condition"],
                "tide": tide_info["current_tide"],
            },
            "pfz_zones": pfz_zones,
            "geofence": geofence_info,
            "sources": safety_eval["sources"]
        }


orca_orchestrator = Orchestrator()
