"""
Fire Risk API Endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from app.models.weather_data import FireRiskDataResponse
from app.services.wild_fire_risk_service import WildfireRiskService

router = APIRouter()

# Initialize the service
wildfire_risk_service = WildfireRiskService()


@router.get("/by-location", response_model=FireRiskDataResponse)
def get_fire_risk_by_location(
    longitude: float = Query(..., description="Longitude"),
    latitude: float = Query(..., description="Latitude"),
):
    """
    Get wildfire risk index by location using ECMWF satellite data

    - **longitude**: Longitude coordinate
    - **latitude**: Latitude coordinate

    Returns wildfire risk index based on temperature, humidity, wind speed, and precipitation
    """
    try:
        data = wildfire_risk_service.get_wildfire_risk_index_by_location(
            longitude=longitude, latitude=latitude
        )
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch wildfire risk data: {str(e)}",
        )
