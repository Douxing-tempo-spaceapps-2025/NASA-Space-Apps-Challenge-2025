"""
precipitation api endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.weather_data import PrecipitationDataResponse
from app.services.precipitation_service import precipitation_service
from app.models.weather_data import PrecipitationData

router = APIRouter()


# @router.get("/", response_model=List[PrecipitationDataResponse])
# async def get_precipitation_data(
#     lat: Optional[float] = Query(None, description="Latitude"),
#     lon: Optional[float] = Query(None, description="Longitude"),
#     distance: Optional[int] = Query(50, description="Search radius (km)"),
#     start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
#     end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
# ):
#     """
#     Get precipitation data

#     - **lat**: Latitude coordinate
#     - **lon**: Longitude coordinate
#     - **distance**: Search radius, default 50km
#     - **start_date**: Start date for data retrieval (YYYY-MM-DD). Default: 7 days ago
#     - **end_date**: End date for data retrieval (YYYY-MM-DD). Default: 5 days ago

#     **Note**: GPM IMERG data has a 3-7 day publication delay.
#     """
#     try:
#         if lat is not None and lon is not None:
#             data = await precipitation_service.get_precipitation_data_near_location(
#                 lat=lat,
#                 lon=lon,
#                 distance_km=distance,
#                 start_date=start_date,
#                 end_date=end_date,
#             )
#         else:
#             raise HTTPException(
#                 status_code=400, detail="Latitude and longitude are required"
#             )
#         return data
#     except Exception as e:
#         raise HTTPException(
#             status_code=500, detail=f"Failed to fetch precipitation data: {str(e)}"
#         )


@router.get("/by-location/current", response_model=PrecipitationDataResponse)
def get_current_precipitation_by_location(
    longitude: float = Query(..., description="Longitude"),
    latitude: float = Query(..., description="Latitude"),
):
    """
    Get current precipitation by location (past 7 days cumulative)

    - **longitude**: Longitude coordinate
    - **latitude**: Latitude coordinate

    Returns total precipitation accumulated over the past 7 days.
    Global coverage (60°N - 60°S) with ~11km resolution. Updates every 30 minutes.
    """
    try:
        data = precipitation_service.get_current_precipitation_by_location(
            longitude=longitude, latitude=latitude
        )
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch current precipitation data: {str(e)}",
        )


@router.get("/by-location")
def get_precipitation_data_by_location(
    longitude: float = Query(..., description="Longitude"),
    latitude: float = Query(..., description="Latitude"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """
    Get precipitation data by location

    Returns the total precipitation value (mm) for the specified location and date range.
    """
    try:
        # Set default dates if not provided (7 days ago to 5 days ago, considering data delay)
        if not start_date:
            start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")

        data = precipitation_service.get_precipitation_data_by_location(
            longitude=longitude,
            latitude=latitude,
            start_date_str=start_date,
            end_date_str=end_date,
        )

        # Return a structured response
        return {
            "longitude": longitude,
            "latitude": latitude,
            "start_date": start_date,
            "end_date": end_date,
            "total_precipitation_mm": data,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch precipitation data: {str(e)}"
        )
