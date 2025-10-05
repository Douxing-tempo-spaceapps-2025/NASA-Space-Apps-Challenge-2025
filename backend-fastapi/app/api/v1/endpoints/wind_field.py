"""
Wind Field API Endpoints
"""

import datetime
from fastapi import HTTPException, Query
from fastapi.routing import APIRouter
from typing import List, Optional
from app.models.weather_data import WindFieldDataResponse, WindParticleData
from app.services.wind_field_service import wind_field_service

router = APIRouter()


# @router.get("/", response_model=WindFieldDataResponse)
# async def get_wind_field_data(
#     lat: Optional[float] = Query(None, description="Latitude"),
#     lon: Optional[float] = Query(None, description="Longitude"),
#     distance: Optional[int] = Query(50, description="Search radius (km)"),
#     start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
#     end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
# ):
#     """
#     Get wind field data with particle animation

#     - **lat**: Latitude coordinate
#     - **lon**: Longitude coordinate
#     - **distance**: Search radius, default 50km
#     - **start_date**: Start date in YYYY-MM-DD format
#     - **end_date**: End date in YYYY-MM-DD format
#     """
#     try:
#         wind_field_data = await wind_field_service.get_wind_field_data(
#             lat=lat,
#             lon=lon,
#             distance_km=distance,
#             start_date=start_date,
#             end_date=end_date,
#         )
#         return wind_field_data
#     except Exception as e:
#         raise HTTPException(
#             status_code=500, detail=f"Failed to fetch wind field data: {str(e)}"
#         )


# @router.get("/particles", response_model=List[WindParticleData])
# async def get_wind_particle_data(
#     lat: Optional[float] = Query(None, description="Latitude"),
#     lon: Optional[float] = Query(None, description="Longitude"),
#     distance: Optional[int] = Query(50, description="Search radius (km)"),
# ):
#     """
#     Get wind field particle animation data

#     - **lat**: Latitude coordinate
#     - **lon**: Longitude coordinate
#     - **distance**: Search radius, default 50km
#     """
#     try:
#         particle_data = await wind_field_service.get_wind_particle_data(
#             lat=lat, lon=lon, distance_km=distance
#         )
#         return particle_data
#     except Exception as e:
#         raise HTTPException(
#             status_code=500, detail=f"Failed to fetch wind particle data: {str(e)}"
#         )

