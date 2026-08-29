"""INCOIS + NDMA alert fetcher.

Scrapes INCOIS high wave alerts and parses NDMA SACHET CAP feeds.
"""
import httpx
from bs4 import BeautifulSoup

INCOIS_ALERTS_URL = "https://incois.gov.in/portal/osf/Alerts.html"
NDMA_SACHET_URL = "https://sachet.ndma.gov.in"  # CAP RSS feed


async def fetch_incois_alerts() -> list[dict]:
    """Fetch high wave and swell surge alerts from INCOIS."""
    headers = {"User-Agent": "MarineSpace/1.0 (ORCA Marine Intelligence)"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(INCOIS_ALERTS_URL, headers=headers, timeout=15.0)
            response.raise_for_status()
        except Exception as e:
            return [{"error": str(e), "source": "INCOIS"}]
    
    soup = BeautifulSoup(response.text, "html.parser")
    alerts = []
    
    for table in soup.find_all("table"):
        for row in table.find_all("tr")[1:]:
            cols = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
            if len(cols) >= 3:
                alerts.append({
                    "region": cols[0],
                    "warning_type": cols[1],
                    "details": cols[2] if len(cols) > 2 else "",
                    "source": "INCOIS",
                })
    
    return alerts
