"""Geofencing engine using Shapely.

Loads GeoJSON boundary files and performs fast
point-in-polygon checks using PreparedGeometry + STRtree.
"""
import json
import os
from shapely.geometry import shape, Point
from shapely.prepared import prep
from shapely.strtree import STRtree
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")


class GeofenceEngine:
    def __init__(self):
        self.layers: dict[str, dict] = {}
        self._loaded = False
    
    def load_all(self):
        """Load all GeoJSON boundary files."""
        layer_files = {
            "eez": "india_eez.geojson",
            "andaman_eez": "andaman_eez.geojson",
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
        
        self._loaded = True
    
    def check_location(self, lat: float, lon: float) -> dict:
        """Check which zones a point falls within."""
        if not self._loaded:
            self.load_all()
        
        point = Point(lon, lat)  # Note: Point(x=lon, y=lat)
        results = {
            "in_eez": False,
            "in_mpa": False,
            "mpa_details": None,
            "nearby_boundaries": [],
        }
        
        # Check EEZ
        for layer_name in ["eez", "andaman_eez"]:
            layer = self.layers.get(layer_name)
            if layer:
                for prep_geom in layer["prepared"]:
                    if prep_geom.contains(point):
                        results["in_eez"] = True
                        break
        
        # Check MPAs
        layer = self.layers.get("mpa")
        if layer and layer["tree"]:
            candidates = layer["tree"].query(point, predicate="intersects")
            for idx in candidates:
                if layer["prepared"][idx].contains(point):
                    results["in_mpa"] = True
                    results["mpa_details"] = layer["metadata"][idx]
                    break
        
        return results


# Singleton
geofence_engine = GeofenceEngine()
