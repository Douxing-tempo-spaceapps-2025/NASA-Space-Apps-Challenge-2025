"""
Fire Data API Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.models.fire_data import FireDataResponse, FireDataRequest
from app.services.firms_service import firms_service

router = APIRouter()


@router.get("/", response_model=List[FireDataResponse])
async def get_fire_data(
    days: Optional[int] = Query(2, description="Number of days")
):
    """
    Get US fire data for specified number of days
    
    - **days**: Number of recent days to fetch data, default 2 days
    """
    try:
        fire_data = await firms_service.get_us_fires_by_days(days=days)
        
        # Convert to response format
        response_data = []
        for data in fire_data:
            response_data.append(FireDataResponse(
                latitude=data.latitude,
                longitude=data.longitude,
                brightness=data.brightness,
                scan=data.scan,
                track=data.track,
                acq_date=data.acq_date,
                acq_time=data.acq_time,
                satellite=data.satellite,
                confidence=str(data.confidence),
                version=data.version,
                bright_t31=data.bright_t31,
                frp=data.frp,
                daynight=data.daynight
            ))
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch fire data: {str(e)}")


@router.get("/recent")
async def get_recent_fire_data():
    """Get latest US fire data (default 24h or 2 days)"""
    try:
        fire_data = await firms_service.get_us_fires_latest()
        
        # Convert to response format - return ALL fire points
        response_data = []
        for data in fire_data:  # Return ALL records
            response_data.append(FireDataResponse(
                latitude=data.latitude,
                longitude=data.longitude,
                brightness=data.brightness,
                scan=data.scan,
                track=data.track,
                acq_date=data.acq_date,
                acq_time=data.acq_time,
                satellite=data.satellite,
                confidence=str(data.confidence),
                version=data.version,
                bright_t31=data.bright_t31,
                frp=data.frp,
                daynight=data.daynight
            ))
        
        return {
            "message": "Latest US fire data",
            "count": len(fire_data),
            "data": response_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recent fire data: {str(e)}")


