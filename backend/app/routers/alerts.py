from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_active_alerts():
    """Get all active marine alerts (INCOIS + NDMA + IMD)."""
    # TODO: Implement alert fetching in Phase 2
    return {
        "alerts": [],
        "message": "Alert system - coming in Phase 2",
    }


@router.get("/high-wave")
async def get_high_wave_alerts():
    """Get INCOIS high wave alerts."""
    return {"alerts": [], "source": "INCOIS"}


@router.get("/cyclone")
async def get_cyclone_alerts():
    """Get IMD cyclone bulletins."""
    return {"alerts": [], "source": "IMD RSMC"}


@router.get("/tsunami")
async def get_tsunami_alerts():
    """Get INCOIS ITEWC tsunami alerts."""
    return {"alerts": [], "source": "INCOIS ITEWC"}
