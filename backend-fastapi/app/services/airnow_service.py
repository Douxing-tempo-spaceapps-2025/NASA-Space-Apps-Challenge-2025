"""
AirNow Service - Python version of airnowService.ts
"""
import httpx
import json
from typing import List, Optional
from loguru import logger
from app.models.air_quality import AirNowData
from app.core.config import settings


class AirNowService:
    """Service for fetching AirNow air quality data"""
    
    def __init__(self):
        self.base_url = "https://files.airnowtech.org/airnow/today/reportingarea.dat"
        self.cache_key = "airnow:latest"
        self.cache_expiry = 3600  # 1 hour
    
    async def fetch_latest_airnow(self) -> List[AirNowData]:
        """
        Fetch latest AirNow data from the API
        Equivalent to fetchLatestAirNow() in Express service
        """
        try:
            logger.info("🌬️ Fetching AirNow data...")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    self.base_url,
                    headers={
                        "Cache-Control": "no-cache",
                        "Pragma": "no-cache",
                    }
                )
                response.raise_for_status()
            
            text_data = response.text
            lines = [line.strip() for line in text_data.split("\n") if line.strip()]
            all_data: List[AirNowData] = []
            
            for line in lines:
                parts = [part.strip() for part in line.split("|")]
                if len(parts) >= 14:
                    try:
                        date, date2, time, _, _, _, _, city, state, lat, lng, pollutant, aqi, category = parts[:14]
                        
                        # Validate AQI is a number
                        aqi_value = int(aqi) if aqi.isdigit() else None
                        if aqi_value is not None:
                            all_data.append(AirNowData(
                                date=date,
                                time=time,
                                state=state,
                                city=city,
                                pollutant=pollutant,
                                aqi=aqi_value,
                                category=category,
                                latitude=float(lat) if lat else 0.0,
                                longitude=float(lng) if lng else 0.0,
                            ))
                    except (ValueError, IndexError) as e:
                        logger.warning(f"⚠️ Error parsing line: {line[:50]}... - {e}")
                        continue
            
            logger.info(f"✅ AirNow data downloaded and processed: {len(all_data)} records")
            return all_data
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch AirNow data: {e}")
            raise
    
    async def get_air_quality_by_location(
        self, 
        lat: Optional[float] = None, 
        lon: Optional[float] = None,
        distance: int = 25,
        state: Optional[str] = None,
        city: Optional[str] = None
    ) -> List[AirNowData]:
        """
        Get air quality data filtered by location
        """
        try:
            # For now, fetch fresh data (later we'll add caching)
            all_data = await self.fetch_latest_airnow()
            
            filtered_data = all_data
            
            # Apply filters
            if state:
                filtered_data = [d for d in filtered_data if d.state.lower() == state.lower()]
            
            if city:
                filtered_data = [d for d in filtered_data if d.city.lower() == city.lower()]
            
            # TODO: Add distance-based filtering when lat/lon are provided
            # This would require implementing a distance calculation function
            
            return filtered_data
            
        except Exception as e:
            logger.error(f"❌ Failed to get air quality by location: {e}")
            raise
    
    async def get_current_air_quality(self) -> List[AirNowData]:
        """Get current air quality data"""
        return await self.fetch_latest_airnow()


# Create service instance
airnow_service = AirNowService()
