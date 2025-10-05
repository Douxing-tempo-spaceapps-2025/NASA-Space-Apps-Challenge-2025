"""
Air Quality Data Models
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AirNowData(BaseModel):
    """AirNow data model matching the Express service structure"""
    date: str
    time: str
    state: str
    city: str
    pollutant: str
    aqi: int
    category: str
    latitude: float
    longitude: float


class AirQualityResponse(BaseModel):
    """API response model for air quality data"""
    location: str = Field(..., description="Location name (city, state)")
    aqi: int = Field(..., description="Air Quality Index")
    category: str = Field(..., description="AQI category (Good, Moderate, etc.)")
    timestamp: str = Field(..., description="Data timestamp")
    pollutants: dict = Field(..., description="Pollutant concentrations")
    latitude: Optional[float] = Field(None, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, description="Longitude coordinate")


class AirQualityRequest(BaseModel):
    """Request model for air quality queries"""
    lat: Optional[float] = Field(None, description="Latitude coordinate")
    lon: Optional[float] = Field(None, description="Longitude coordinate")
    distance: Optional[int] = Field(25, description="Search radius in kilometers")
    state: Optional[str] = Field(None, description="State filter")
    city: Optional[str] = Field(None, description="City filter")
