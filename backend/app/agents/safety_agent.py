"""Safety & Alert Agent - Deterministic Marine Hazard Assessment.

Strict deterministic threshold rules to evaluate sea conditions.
The LLM does NOT calculate this score; it only translates the output into natural language.
"""
from typing import Optional


def evaluate_safety(
    weather_summary: dict,
    marine_summary: dict,
    geofence_info: Optional[dict] = None,
    alerts: Optional[list[dict]] = None
) -> dict:
    """Evaluate sea venturing safety based on hard meteorological and oceanographic rules."""
    score = 100
    reasons = []
    recommendations = []
    sources = ["Open-Meteo Marine", "Open-Meteo Weather", "INCOIS OSF"]

    wave_height = marine_summary.get("wave_height_m", 1.2)
    max_wave = marine_summary.get("max_wave_12h_m", wave_height)
    wind_speed = weather_summary.get("wind_speed_knots", 12.0)
    wind_gusts = weather_summary.get("wind_gusts_knots", wind_speed)
    visibility = weather_summary.get("visibility_m", 8000)
    cape = weather_summary.get("cape_j_kg", 200)

    # 1. Wave Height Checks
    if max_wave >= 3.0:
        score -= 55
        reasons.append(f"Dangerous wave heights ({max_wave}m) exceeding safe operational limits (3.0m).")
        recommendations.append("DO NOT VENTURE OUT: High probability of vessel capsizing for motorized craft.")
    elif max_wave >= 2.0:
        score -= 30
        reasons.append(f"Moderate to rough wave conditions ({max_wave}m).")
        recommendations.append("Small fiber boats and non-mechanized craft should avoid deep-sea waters.")
    elif max_wave >= 1.5:
        score -= 10
        reasons.append(f"Slight chop observed with wave heights around {max_wave}m.")

    # 2. Wind & Gust Checks
    if wind_gusts >= 35.0:
        score -= 40
        reasons.append(f"Severe wind gusts up to {wind_gusts} knots detected.")
        recommendations.append("Severe squall risk. Secure all deck gear and stay close to shore.")
    elif wind_speed >= 22.0:
        score -= 25
        reasons.append(f"Strong winds of {wind_speed} knots.")
        recommendations.append("High fuel consumption due to strong headwinds; proceed with caution.")

    # 3. Visibility & Convective Storms (CAPE)
    if visibility < 2000:
        score -= 20
        reasons.append(f"Reduced visibility ({visibility}m) due to fog or squall line.")
        recommendations.append("Sound foghorn and operate navigation lights.")

    if cape >= 1000:
        score -= 15
        reasons.append("High convective energy (CAPE > 1000 J/kg) indicates possible sudden thunderstorms.")
        recommendations.append("Watch the horizon for dark cumulonimbus cloud formations.")

    # 4. Geofencing Constraints
    if geofence_info:
        sources.append("Survey of India / UNCLOS EEZ Boundaries")
        if geofence_info.get("near_imbl"):
            score -= 20
            imbl_dist = geofence_info.get("imbl_distance_nm", "close")
            boundary_name = geofence_info.get("nearest_boundary_name", "IMBL")
            reasons.append(f"Vessel route is within {imbl_dist} NM of {boundary_name}.")
            recommendations.append(f"STRICT GEOFENCE WARNING: Do not cross into {boundary_name} to avoid vessel seizure.")

        if geofence_info.get("in_mpa"):
            score -= 30
            mpa_name = geofence_info.get("mpa_details", {}).get("name", "Marine Protected Area")
            reasons.append(f"Target coordinates fall inside {mpa_name}.")
            recommendations.append("FISHING PROHIBITED: Protected ecological sanctuary under Wildlife Protection Act.")

    # 5. Active Government Alerts
    if alerts:
        sources.append("NDMA / IMD RSMC")
        for alert in alerts:
            if alert.get("severity") in ["danger", "warning"]:
                score -= 15
                reasons.append(f"Active Alert: {alert.get('title')}")
                break

    # Final Classification
    final_score = max(5, min(100, score))
    if final_score >= 75:
        level = "SAFE"
    elif final_score >= 45:
        level = "CAUTION"
    else:
        level = "DANGEROUS"

    if not reasons:
        reasons.append("Calm sea state, favorable winds, and clear visibility.")
        recommendations.append("Favorable conditions for routine artisanal and mechanized fishing.")

    return {
        "level": level,
        "score": final_score,
        "wave_height_m": wave_height,
        "wind_speed_knots": wind_speed,
        "reasons": reasons,
        "recommendations": recommendations,
        "sources": list(dict.fromkeys(sources))
    }
