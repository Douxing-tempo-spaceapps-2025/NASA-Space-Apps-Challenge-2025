"""
FIRMS Service - Simplified version with only two public methods
"""
import httpx
from typing import List
from loguru import logger
from app.models.fire_data import FireData
from app.core.config import settings


class FIRMSService:
    """Service for fetching NASA FIRMS fire data"""
    
    def __init__(self):
        self.base_url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"
        self.api_key = getattr(settings, 'nasa_firms_api_key', None)
        if not self.api_key:
            raise ValueError(
                "NASA_FIRMS_API_KEY environment variable is required. "
                "Please get your free API key from https://firms.modaps.eosdis.nasa.gov/api/map_key "
                "and set it in your .env file."
            )
        
        # US bounds
        self.us_bounds = {
            "north": 49.0,
            "south": 24.5,
            "east": -66.9,
            "west": -125.0,
        }
    
    def _is_in_united_states(self, lat: float, lon: float) -> bool:
        """Check if coordinates are within US bounds"""
        return (
            self.us_bounds["south"] <= lat <= self.us_bounds["north"] and
            self.us_bounds["west"] <= lon <= self.us_bounds["east"]
        )
    
    async def _fetch_firms_data(self, days: int) -> List[FireData]:
        """Internal method to fetch FIRMS data"""
        try:
            logger.info(f"🔥 Fetching FIRMS fire data for {days} days...")
            
            source = "VIIRS_SNPP_NRT"
            url = f"{self.base_url}/{self.api_key}/{source}/-125,24.5,-66.9,49.0/{days}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    url,
                    headers={
                        "Cache-Control": "no-cache",
                        "Pragma": "no-cache",
                        "User-Agent": "NASA-AirQuality-Backend/1.0",
                    }
                )
                response.raise_for_status()

            csv_data = response.text
            lines = [line.strip() for line in csv_data.split("\n") if line.strip()]
            data_lines = lines[1:] if len(lines) > 1 else []

            all_data: List[FireData] = []
            for line in data_lines:
                parts = [part.strip().strip('"') for part in line.split(",")]
                if len(parts) >= 14:
                    try:
                        fire_data = FireData(
                            latitude=float(parts[0]) if parts[0] else 0.0,
                            longitude=float(parts[1]) if parts[1] else 0.0,
                            brightness=float(parts[2]) if parts[2] else 0.0,
                            scan=float(parts[3]) if parts[3] else 0.0,
                            track=float(parts[4]) if parts[4] else 0.0,
                            acq_date=parts[5] or "",
                            acq_time=parts[6] or "",
                            satellite=parts[7] or "",
                            confidence=parts[9] or "0",
                            version=parts[10] or "",
                            bright_t31=float(parts[11]) if parts[11] else 0.0,
                            frp=float(parts[12]) if parts[12] else 0.0,
                            daynight=parts[13] or "",
                            type=0,
                        )
                        if fire_data.latitude != 0 and fire_data.longitude != 0:
                            all_data.append(fire_data)
                    except Exception as e:
                        logger.warning(f"⚠️ Error parsing line: {line[:50]}... - {e}")
                        continue

            logger.info(f"✅ Total fire points fetched: {len(all_data)}")
            return all_data

        except Exception as e:
            logger.error(f"❌ Failed to fetch FIRMS data: {e}")
            raise
    
    async def get_us_fires_latest(self) -> List[FireData]:
        """
        Get latest US fire data (default 24h or 2 days)
        """
        try:
            # Fetch 2 days of data to ensure we get today's data
            all_data = await self._fetch_firms_data(days=2)
            us_fires = [fire for fire in all_data if self._is_in_united_states(fire.latitude, fire.longitude)]
            
            logger.info(f"📅 Latest US fires: {len(us_fires)} total")
            return us_fires
            
        except Exception as e:
            logger.error(f"❌ Failed to get latest US fire data: {e}")
            raise
    
    async def get_us_fires_by_days(self, days: int = 2) -> List[FireData]:
        """
        Get US fire data for specified number of days
        """
        try:
            all_data = await self._fetch_firms_data(days=days)
            us_fires = [fire for fire in all_data if self._is_in_united_states(fire.latitude, fire.longitude)]
            
            logger.info(f"📅 US fires for {days} days: {len(us_fires)} total")
            return us_fires
            
        except Exception as e:
            logger.error(f"❌ Failed to get US fire data for {days} days: {e}")
            raise


# Create service instance
firms_service = FIRMSService()
