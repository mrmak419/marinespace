"""Geofencing engine using Shapely.

Loads GeoJSON boundary files and performs fast
point-in-polygon & distance checks using PreparedGeometry + STRtree.
"""
import json
import os
import math
from typing import Optional
from shapely.geometry import shape, Point, LineString
from shapely.prepared import prep
from shapely.strtree import STRtree

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")


def haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in Nautical Miles."""
    R = 3440.065  # Earth radius in Nautical Miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> str:
    """Calculate 8-point compass bearing from point 1 to point 2."""
    y = math.sin(math.radians(lon2 - lon1)) * math.cos(math.radians(lat2))
    x = math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) - math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(math.radians(lon2 - lon1))
    bearing = (math.degrees(math.atan2(y, x)) + 360) % 360
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    idx = round(bearing / 45) % 8
    return directions[idx]


class GeofenceEngine:
    def __init__(self):
        self.layers: dict[str, dict] = {}
        self.ports: list[dict] = []
        self._loaded = False

    def load_all(self):
        """Load all GeoJSON boundary files."""
        layer_files = {
            "eez": "india_eez.geojson",
            "maritime_boundaries": "maritime_boundaries.geojson",
            "mpa": "marine_protected_areas.geojson",
        }

        for name, filename in layer_files.items():
            filepath = os.path.join(DATA_DIR, filename)
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)

                features = data.get("features", [])
                geometries = []
                prepared = []
                metadata = []

                for feat in features:
                    geom = shape(feat["geometry"])
                    geometries.append(geom)
                    prepared.append(prep(geom))
                    metadata.append(feat.get("properties", {}))

                self.layers[name] = {
                    "geometries": geometries,
                    "prepared": prepared,
                    "metadata": metadata,
                    "tree": STRtree(geometries) if geometries else None,
                }

        # Load ports
        ports_file = os.path.join(DATA_DIR, "indian_ports.geojson")
        if os.path.exists(ports_file):
            with open(ports_file, "r", encoding="utf-8") as f:
                ports_data = json.load(f)
                self.ports = [
                    {
                        "name": f["properties"]["name"],
                        "state": f["properties"]["state"],
                        "lon": f["geometry"]["coordinates"][0],
                        "lat": f["geometry"]["coordinates"][1],
                        "species": f["properties"].get("major_species", [])
                    }
                    for f in ports_data.get("features", [])
                ]

        self._loaded = True

    def check_location(self, lat: float, lon: float) -> dict:
        """Check which zones a point falls within and distance to boundaries."""
        if not self._loaded:
            self.load_all()

        point = Point(lon, lat)  # Note: Point(x=lon, y=lat)
        results = {
            "latitude": lat,
            "longitude": lon,
            "in_indian_eez": False,
            "in_mpa": False,
            "mpa_details": None,
            "near_imbl": False,
            "imbl_distance_nm": None,
            "nearest_boundary_name": None,
            "nearest_port": None,
            "warnings": [],
        }

        # Check EEZ
        eez_layer = self.layers.get("eez")
        if eez_layer:
            for prep_geom in eez_layer["prepared"]:
                if prep_geom.contains(point):
                    results["in_indian_eez"] = True
                    break

        # Check MPAs
        mpa_layer = self.layers.get("mpa")
        if mpa_layer and mpa_layer["tree"]:
            candidates = mpa_layer["tree"].query(point, predicate="intersects")
            for idx in candidates:
                if mpa_layer["prepared"][idx].contains(point):
                    results["in_mpa"] = True
                    results["mpa_details"] = mpa_layer["metadata"][idx]
                    results["warnings"].append(
                        f"RESTRICTED AREA: Inside {results['mpa_details'].get('name', 'MPA')}. "
                        f"{results['mpa_details'].get('description', '')}"
                    )
                    break

        # Check Distance to IMBL
        imbl_layer = self.layers.get("maritime_boundaries")
        if imbl_layer:
            min_dist_nm = float("inf")
            closest_imbl = None
            for geom, meta in zip(imbl_layer["geometries"], imbl_layer["metadata"]):
                # approximate distance by checking distance in degrees (~60 NM per degree)
                deg_dist = geom.distance(point)
                nm_dist = round(deg_dist * 60.0, 1)
                if nm_dist < min_dist_nm:
                    min_dist_nm = nm_dist
                    closest_imbl = meta

            if closest_imbl is not None:
                results["imbl_distance_nm"] = min_dist_nm
                results["nearest_boundary_name"] = closest_imbl.get("name", "IMBL")
                if min_dist_nm <= 15.0:
                    results["near_imbl"] = True
                    results["warnings"].append(
                        f"CRITICAL IMBL WARNING: Vessel is {min_dist_nm} NM from {closest_imbl.get('name')}. "
                        f"{closest_imbl.get('warning', 'Maintain safe distance from international boundary.')}"
                    )

        # Nearest Port
        if self.ports:
            closest_port = min(
                self.ports,
                key=lambda p: haversine_nm(lat, lon, p["lat"], p["lon"])
            )
            dist_to_port = haversine_nm(lat, lon, closest_port["lat"], closest_port["lon"])
            bearing = calculate_bearing(closest_port["lat"], closest_port["lon"], lat, lon)
            results["nearest_port"] = {
                "name": closest_port["name"],
                "state": closest_port["state"],
                "distance_nm": dist_to_port,
                "distance_km": round(dist_to_port * 1.852, 1),
                "bearing_from_port": bearing,
            }

        return results


# Singleton
geofence_engine = GeofenceEngine()
