"""
Temperature API Endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.weather_data import TemperatureDataResponse
from app.services.temperature_service import temperature_service

router = APIRouter()


@router.get("/by-location", response_model=TemperatureDataResponse)
def get_temperature_data_by_location(
    longitude: float = Query(..., description="Longitude"),
    latitude: float = Query(..., description="Latitude"),
):
    """
    Get current temperature by location using ECMWF satellite data

    - **longitude**: Longitude coordinate
    - **latitude**: Latitude coordinate
    
    """
    try:
        data = temperature_service.get_current_temperature_by_location(
            longitude=longitude, latitude=latitude
        )
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch temperature data: {str(e)}",
        )
