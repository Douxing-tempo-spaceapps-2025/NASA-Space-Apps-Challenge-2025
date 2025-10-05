"""
Humidity API Endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.weather_data import HumidityDataResponse
from app.services.humidity_service import humidity_service

router = APIRouter()


@router.get("/by-location", response_model=HumidityDataResponse)
def get_humidity_data_by_location(
    longitude: float = Query(..., description="Longitude"),
    latitude: float = Query(..., description="Latitude"),
):
    """
    Get current relative humidity by location using ECMWF forecast data

    - **longitude**: Longitude coordinate
    - **latitude**: Latitude coordinate

    Returns relative humidity (%), calculated from 2m air temperature and dewpoint temperature.
    Global coverage with ~27.8km resolution. Updates twice daily.
    """
    try:
        data = humidity_service.get_current_humidity_by_location(
            longitude=longitude, latitude=latitude
        )
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch humidity data: {str(e)}",
        )
