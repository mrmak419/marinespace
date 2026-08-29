"""Test all API connections.

Run: python scripts/test_apis.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.tools.weather import fetch_weather
from app.tools.marine import fetch_marine_conditions

# Test coordinates
VIZAG = (17.6868, 83.2185)
CHENNAI = (13.0827, 80.2707)
MUMBAI = (18.9220, 72.8347)


async def test_open_meteo_weather():
    print("\n=== Testing Open-Meteo Weather API ===")
    try:
        data = await fetch_weather(*VIZAG)
        temp = data["hourly"]["temperature_2m"][0]
        wind = data["hourly"]["wind_speed_10m"][0]
        print(f"  Vizag - Temp: {temp}C, Wind: {wind} knots")
        print(f"  ✅ Weather API working")
        return True
    except Exception as e:
        print(f"  ❌ Weather API failed: {e}")
        return False


async def test_open_meteo_marine():
    print("\n=== Testing Open-Meteo Marine API ===")
    try:
        data = await fetch_marine_conditions(*VIZAG)
        wave = data["hourly"]["wave_height"][0]
        sst = data["hourly"]["sea_surface_temperature"][0]
        print(f"  Vizag - Wave height: {wave}m, SST: {sst}C")
        print(f"  ✅ Marine API working")
        return True
    except Exception as e:
        print(f"  ❌ Marine API failed: {e}")
        return False


async def main():
    print("MarineSpace API Connection Tests")
    print("=" * 40)
    
    results = []
    results.append(await test_open_meteo_weather())
    results.append(await test_open_meteo_marine())
    
    print(f"\n{'=' * 40}")
    passed = sum(results)
    total = len(results)
    print(f"Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All APIs working!")
    else:
        print("⚠️ Some APIs failed. Check the errors above.")


if __name__ == "__main__":
    asyncio.run(main())
