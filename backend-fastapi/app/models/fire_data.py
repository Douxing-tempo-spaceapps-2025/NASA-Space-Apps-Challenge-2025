"""
Fire Data Models
"""
from pydantic import BaseModel, Field
from typing import Optional


class FireData(BaseModel):
    """Fire data model matching the Express service structure"""
    latitude: float
    longitude: float
    brightness: float
    scan: float
    track: float
    acq_date: str
    acq_time: str
    satellite: str
    confidence: str
    version: str
    bright_t31: float
    frp: float
    daynight: str
    type: int
    source: str = ""  # Data source (VIIRS_SNPP_NRT, VIIRS_SNPP, etc.)


class FireDataWithLocation(FireData):
    """Fire data with location information"""
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None


class FireDataResponse(BaseModel):
    """API response model for fire data"""
    latitude: float = Field(..., description="Fire latitude")
    longitude: float = Field(..., description="Fire longitude")
    brightness: float = Field(..., description="Fire brightness temperature")
    scan: float = Field(..., description="Scan angle")
    track: float = Field(..., description="Track angle")
    acq_date: str = Field(..., description="Acquisition date")
    acq_time: str = Field(..., description="Acquisition time")
    satellite: str = Field(..., description="Satellite name")
    confidence: str = Field(..., description="Confidence level")
    version: str = Field(..., description="Data version")
    bright_t31: float = Field(..., description="Brightness temperature T31")
    frp: float = Field(..., description="Fire Radiative Power")
    daynight: str = Field(..., description="Day/Night indicator")


class FireDataRequest(BaseModel):
    """Request model for fire data queries"""
    lat: Optional[float] = Field(None, description="Latitude coordinate")
    lon: Optional[float] = Field(None, description="Longitude coordinate")
    distance: Optional[int] = Field(100, description="Search radius in kilometers")
    days: Optional[int] = Field(7, description="Number of recent days to fetch")
    country: Optional[str] = Field(None, description="Country filter")
    confidence_min: Optional[float] = Field(None, description="Minimum confidence level")
