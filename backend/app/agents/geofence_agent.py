"""Geofence Agent - Maritime boundary specialist.

Checks vessel positions against:
- India EEZ boundary
- International Maritime Boundary Lines (IMBL)
- Marine Protected Areas (MPAs)
- Restricted/prohibited zones

Uses Shapely PreparedGeometry + STRtree for O(log N) lookups.
"""

# TODO: Phase 3 - Agent implementation
