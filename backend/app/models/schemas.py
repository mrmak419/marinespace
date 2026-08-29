from pydantic import BaseModel
from typing import Optional
from enum import Enum


class SafetyLevel(str, Enum):
    SAFE = "safe"
    CAUTION = "caution"
    DANGEROUS = "dangerous"


class LocationQuery(BaseModel):
    latitude: float
    longitude: float
    name: Optional[str] = None


class WeatherData(BaseModel):
    temperature: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    wind_gusts: Optional[float] = None
    precipitation: Optional[float] = None
    visibility: Optional[float] = None
    pressure: Optional[float] = None


class MarineData(BaseModel):
    wave_height: Optional[float] = None
    wave_direction: Optional[float] = None
    wave_period: Optional[float] = None
    swell_height: Optional[float] = None
    sst: Optional[float] = None
    current_speed: Optional[float] = None
    current_direction: Optional[float] = None


class SafetyAssessment(BaseModel):
    level: SafetyLevel
    score: int  # 0-100
    reasons: list[str]
    recommendations: list[str]
    sources: list[str]
