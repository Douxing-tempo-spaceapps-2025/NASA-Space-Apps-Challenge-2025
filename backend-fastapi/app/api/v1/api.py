"""
API v1 Router Aggregation
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    air_quality,
    fire_data, 
    tempo_data, 
    tempo_l3_data,
    precipitation,
    temperature,
    wind_field,
    humidity
)


api_router = APIRouter()

# Include endpoint routes
api_router.include_router(
    air_quality.router, prefix="/air-quality", tags=["Air Quality"]
)

api_router.include_router(fire_data.router, prefix="/fire-data", tags=["Fire Data"])


api_router.include_router(
    precipitation.router, prefix="/precipitation", tags=["Precipitation"]
)

api_router.include_router(
    temperature.router,
    prefix="/temperature",
    tags=["Temperature"],
)

api_router.include_router(
    humidity.router,
    prefix="/humidity",
    tags=["Humidity"],
)

api_router.include_router(
    wind_field.router,
    prefix="/wind-field",
    tags=["Wind Field"],
)

api_router.include_router(
    tempo_data.router, 
    prefix="/tempo-data", 
    tags=["TEMPO Data"]
)

api_router.include_router(
    tempo_l3_data.router, 
    prefix="/tempo-l3", 
    tags=["TEMPO L3 Data"]
)
