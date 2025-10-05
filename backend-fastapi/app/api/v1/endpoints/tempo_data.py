"""
TEMPO Data API Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from typing import Optional, Dict, Any
from app.services.tempo_service import tempo_service

router = APIRouter()


@router.get("/search")
async def search_tempo_data(
    product: str = Query(..., description="Data product: hcho or no2"),
    hours_back: Optional[int] = Query(6, description="Hours to look back for data")
) -> Dict[str, Any]:
    """Search for TEMPO data files"""
    try:
        valid_products = list(tempo_service.COLLECTIONS.keys())
        if product not in valid_products:
            raise HTTPException(status_code=400, detail=f"Invalid product. Must be one of: {valid_products}")

        results = await run_in_threadpool(tempo_service.get_latest_data, product, hours_back)

        return {
            "product": product,
            "hours_back": hours_back,
            "files_found": len(results),
            "data": results
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search TEMPO data: {str(e)}")


@router.get("/download")
async def download_tempo_data(
    product: str = Query(..., description="Data product: hcho or no2"),
    hours_back: Optional[int] = Query(6, description="Hours to look back for data")
) -> Dict[str, Any]:
    """Download TEMPO data files"""
    try:
        valid_products = list(tempo_service.COLLECTIONS.keys())
        if product not in valid_products:
            raise HTTPException(status_code=400, detail=f"Invalid product. Must be one of: {valid_products}")

        results = await run_in_threadpool(tempo_service.get_latest_data, product, hours_back)
        if not results:
            return {
                "product": product,
                "hours_back": hours_back,
                "files_found": 0,
                "downloaded_files": [],
                "message": "No data files found for the specified criteria"
            }

        downloaded_files = await run_in_threadpool(tempo_service.get_data_files, results, product, hours_back)

        return {
            "product": product,
            "hours_back": hours_back,
            "files_found": len(results),
            "downloaded_files": downloaded_files,
            "message": f"Successfully downloaded {len(downloaded_files)} files"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download TEMPO data: {str(e)}")


@router.get("/wsti-heatmap")
async def get_wsti_heatmap(
    hours_back: Optional[int] = Query(6, description="Hours to look back for data (will expand to 12h or 24h if no data found)"),
    sample_step: Optional[int] = Query(50, description="Sampling step size to reduce data points")
) -> Dict[str, Any]:
    """
           Get WSTI (Wildfire Smoke Threat Index) heatmap data
           
           Combines HCHO, NO2, and Aerosol Index data to calculate wildfire threat levels
           Uses real UV Aerosol Index data from TEMPO_O3TOT_L2 product
    - **hours_back**: Number of hours to look back, default 48
    """
    try:
        wsti_data = await run_in_threadpool(tempo_service.get_wsti_heatmap_data, hours_back, sample_step)
        
        return {
            "hours_back": hours_back,
            "data_points": len(wsti_data),
            "threat_levels": {
                "Extreme Threat": len([p for p in wsti_data if p.get('level') == 'Extreme Threat']),
                "High Threat": len([p for p in wsti_data if p.get('level') == 'High Threat']),
                "Medium Threat": len([p for p in wsti_data if p.get('level') == 'Medium Threat']),
                "Low Threat": len([p for p in wsti_data if p.get('level') == 'Low Threat']),
                "Safe": len([p for p in wsti_data if p.get('level') == 'Safe'])
            },
            "heatmap_data": wsti_data,
            "message": f"Generated WSTI threat assessment for {len(wsti_data)} locations"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate WSTI heatmap: {str(e)}")


@router.get("/products")
async def get_available_products() -> Dict[str, Any]:
    """Get list of available TEMPO data products"""
    return {
        "available_products": list(tempo_service.COLLECTIONS.keys()),
        "collections": tempo_service.COLLECTIONS,
        "description": {
            "hcho": "Formaldehyde (HCHO) data",
            "no2": "Nitrogen Dioxide (NO2) data", 
            "aerosol": "UV Aerosol Index data from O3 Total Column product"
        }
    }


@router.get("/test-aerosol")
async def test_aerosol_integration(
    hours_back: Optional[int] = Query(12, description="Hours to look back for data")
) -> Dict[str, Any]:
    """Test aerosol data integration without full WSTI calculation"""
    try:
        # Test aerosol data search only
        aerosol_results = await run_in_threadpool(tempo_service.get_latest_data, 'aerosol', hours_back)
        
        return {
            "status": "success",
            "hours_back": hours_back,
            "aerosol_files_found": len(aerosol_results),
            "message": "Aerosol data integration working",
            "sample_file": aerosol_results[0].get('umm', {}).get('GranuleUR', 'N/A') if aerosol_results else None
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


