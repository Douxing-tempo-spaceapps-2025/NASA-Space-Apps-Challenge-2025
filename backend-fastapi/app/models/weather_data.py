"""
Weather Data Models
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import numpy as np


class BaseWeatherData(BaseModel):
    """Base weather data model"""

    longitude: float
    latitude: float
    timestamp: str


class WindData(BaseModel):
    """Wind field data model"""

    wind_speed: float
    wind_direction: float
    """Wind direction in degrees"""


class WindParticleData(BaseModel):
    """Wind particle animation data model"""

    particle_id: str
    velocity_x: float  # X方向速度分量
    velocity_y: float  # Y方向速度分量
    altitude: float  # 高度 (m)
    trajectory: List[dict] = []  # 粒子轨迹点列表


class PrecipitationData(BaseWeatherData):

    precipitation: List[float]


class TemperatureData(BaseWeatherData):
    """Temperature data model"""

    temperature: float  # Temperature in Celsius


class TemperatureDataResponse(BaseModel):
    """Temperature data API response"""

    data: List[TemperatureData]
    metadata: dict


class HumidityData(BaseWeatherData):
    """Humidity data model"""

    relative_humidity: float
    dew_point_celsius: float
    temperature_celsius: float


class HumidityDataResponse(BaseModel):
    """Humidity data API response"""

    data: List[HumidityData]
    metadata: dict


class WindFieldDataResponse(BaseModel):
    """Wind field data API response"""

    data: List[WindData]
    particles: List[WindParticleData]
    metadata: dict


class PrecipitationDataResponse(BaseModel):
    data: List[PrecipitationData]
    metadata: dict


class FireRiskData(BaseModel):
    """Fire risk data model"""

    longitude: float
    latitude: float
    wildfire_risk_index: float
    component_data: Dict[str, float]  # temperature, humidity, wind_speed, precipitation
    metadata: Dict[str, Any]


class FireRiskDataResponse(BaseModel):
    """Fire risk data API response"""

    longitude: float
    latitude: float
    wildfire_risk_index: float
    component_data: Dict[str, float]
    metadata: Dict[str, Any]


class WeatherDataRequest(BaseModel):
    lat: Optional[float] = Field(None, description="纬度")
    lon: Optional[float] = Field(None, description="经度")
    distance: Optional[int] = Field(50, description="搜索半径(km)")
    start_date: Optional[datetime] = Field(None, description="开始时间")
    end_date: Optional[datetime] = Field(None, description="结束时间")
    altitude: Optional[float] = Field(None, description="高度层")
