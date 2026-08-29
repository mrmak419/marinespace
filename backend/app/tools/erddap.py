"""INCOIS ERDDAP client.

Accesses Indian ocean observation data (buoys, wave riders).
Base URL: https://erddap.incois.gov.in/erddap/
"""
import httpx

BASE_URL = "https://erddap.incois.gov.in/erddap"


async def search_datasets(query: str) -> dict:
    """Search for available datasets on INCOIS ERDDAP."""
    url = f"{BASE_URL}/search/index.json"
    params = {"searchFor": query}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=15.0)
        response.raise_for_status()
        return response.json()


async def fetch_buoy_data(dataset_id: str, variables: list[str], time_start: str) -> dict:
    """Fetch tabular data from an INCOIS ERDDAP dataset."""
    vars_str = ",".join(variables)
    url = f"{BASE_URL}/tabledap/{dataset_id}.json?{vars_str}&time>={time_start}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=30.0)
        response.raise_for_status()
        return response.json()
