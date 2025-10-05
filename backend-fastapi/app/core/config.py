"""
Application Configuration Management
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # Application basic information
    app_name: str = "NASA Air Quality API"
    app_version: str = "1.0.0"
    debug: bool = False

    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8000

    # External API configuration
    airnow_api_key: Optional[str] = None
    nasa_firms_api_key: Optional[str] = None
    firms_api_url: str = "https://firms.modaps.eosdis.nasa.gov/api"

    # NASA Earthdata Login credentials (for earthaccess)
    edl_username: Optional[str] = None
    edl_password: Optional[str] = None
    
    # Earthdata authentication
    earthdata_user: Optional[str] = None
    earthdata_pass: Optional[str] = None

    # Database configuration
    database_url: str = "sqlite:///./nasa_air_quality.db"

    # Logging configuration
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Create global settings instance
settings = Settings()
