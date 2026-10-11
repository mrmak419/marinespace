from fastapi import APIRouter
from app.tools.alerts import fetch_all_alerts

router = APIRouter()


@router.get("/")
async def get_active_alerts():
    """Get all active marine alerts (INCOIS + NDMA + IMD)."""
    alerts = await fetch_all_alerts()
    return {
        "status": "success",
        "count": len(alerts),
        "alerts": alerts,
    }


@router.get("/high-wave")
async def get_high_wave_alerts():
    """Get INCOIS high wave alerts."""
    all_alerts = await fetch_all_alerts()
    return {"alerts": [a for a in all_alerts if "INCOIS" in a.get("source", "")], "source": "INCOIS"}


@router.get("/cyclone")
async def get_cyclone_alerts():
    """Get IMD cyclone bulletins."""
    all_alerts = await fetch_all_alerts()
    return {"alerts": [a for a in all_alerts if "IMD" in a.get("source", "")], "source": "IMD RSMC"}
