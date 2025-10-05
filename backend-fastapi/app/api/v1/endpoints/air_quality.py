"""
Air Quality Data API Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.models.air_quality import AirQualityResponse, AirQualityRequest
from app.services.airnow_service import airnow_service

router = APIRouter()


@router.get("/", response_model=List[AirQualityResponse])
async def get_air_quality_data(
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    distance: Optional[int] = Query(25, description="Search radius (km)"),
    state: Optional[str] = Query(None, description="State filter"),
    city: Optional[str] = Query(None, description="City filter")
):
    """
    Get air quality data
    
    - **lat**: Latitude coordinate
    - **lon**: Longitude coordinate  
    - **distance**: Search radius, default 25km
    - **state**: Filter by state
    - **city**: Filter by city
    """
    try:
        # Get raw AirNow data
        airnow_data = await airnow_service.get_air_quality_by_location(
            lat=lat, lon=lon, distance=distance, state=state, city=city
        )
        
        # Convert to response format
        response_data = []
        for data in airnow_data:
            response_data.append(AirQualityResponse(
                location=f"{data.city}, {data.state}",
                aqi=data.aqi,
                category=data.category,
                timestamp=f"{data.date}T{data.time}:00Z",
                pollutants={data.pollutant: data.aqi},  # Simplified for now
                latitude=data.latitude,
                longitude=data.longitude
            ))
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch air quality data: {str(e)}")


@router.get("/current")
async def get_current_air_quality():
    """Get current air quality data"""
    try:
        airnow_data = await airnow_service.get_current_air_quality()
        
        # Convert to dict for JSON serialization
        data_dicts = [item.dict() for item in airnow_data]
        
        return {
            "message": "Current air quality data",
            "count": len(airnow_data),
            "data": data_dicts  # Return all records as dicts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch current air quality data: {str(e)}")


@router.get("/all")
async def get_all_air_quality():
    """Get all air quality data (for testing)"""
    try:
        airnow_data = await airnow_service.get_current_air_quality()
        return {
            "message": "All air quality data",
            "count": len(airnow_data),
            "data": airnow_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch all air quality data: {str(e)}")


@router.get("/forecast")
async def get_air_quality_forecast():
    """Get air quality forecast data"""
    # TODO: Implement air quality forecast data retrieval
    return {"message": "Air quality forecast data endpoint - Coming soon"}
