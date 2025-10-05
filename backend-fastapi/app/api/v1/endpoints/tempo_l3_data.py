"""
TEMPO L3 Data API Endpoints
专门用于测试TEMPO L3数据的API端点
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
import logging
import os

from app.services.tempo_l3_service import TempoL3Service

logger = logging.getLogger(__name__)
router = APIRouter()

# 创建L3服务实例
tempo_l3_service = TempoL3Service()

@router.get("/status")
async def get_l3_status() -> Dict[str, Any]:
    """获取L3数据服务状态"""
    return {
        "status": "L3 service active",
        "provider": "LARC_CLOUD",
        "products": list(tempo_l3_service.COLLECTIONS.keys()),
        "message": "TEMPO L3 data service is running"
    }

@router.get("/search/{product}")
async def search_l3_data(
    product: str,
    hours_back: Optional[int] = Query(24, description="Hours to look back for data")
) -> Dict[str, Any]:
    """搜索L3数据"""
    try:
        results = tempo_l3_service.get_latest_data(product, hours_back)
        
        return {
            "product": product,
            "files_found": len(results),
            "hours_back": hours_back,
            "results": results[:3] if results else [],  # 只返回前3个结果
            "message": f"Found {len(results)} L3 {product} files"
        }
    except Exception as e:
        logger.error(f"Error searching L3 data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to search L3 data: {str(e)}")

@router.get("/download/{product}")
async def download_l3_data(
    product: str,
    hours_back: Optional[int] = Query(24, description="Hours to look back for data")
) -> Dict[str, Any]:
    """下载L3数据文件"""
    try:
        # 搜索数据
        results = tempo_l3_service.get_latest_data(product, hours_back)
        if not results:
            return {
                "product": product,
                "files_downloaded": 0,
                "message": f"No L3 {product} data found"
            }
        
        # 下载文件
        files = tempo_l3_service.get_data_files(results, product, hours_back)
        
        return {
            "product": product,
            "files_downloaded": len(files),
            "files": [os.path.basename(f) for f in files],
            "message": f"Downloaded {len(files)} L3 {product} files"
        }
    except Exception as e:
        logger.error(f"Error downloading L3 data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download L3 data: {str(e)}")

@router.get("/heatmap/{product}")
async def get_l3_heatmap(
    product: str,
    sample_step: Optional[int] = Query(50, description="Sampling step size")
) -> Dict[str, Any]:
    """获取L3热力图数据"""
    try:
        heatmap_data = tempo_l3_service.get_heatmap_data(product, sample_step)
        
        return {
            "product": product,
            "heatmap_data": heatmap_data,
            "total_points": len(heatmap_data),
            "sample_step": sample_step,
            "message": f"Generated {len(heatmap_data)} L3 heatmap points for {product}"
        }
    except Exception as e:
        logger.error(f"Error getting L3 heatmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get L3 heatmap: {str(e)}")

@router.get("/wsti-heatmap")
async def get_l3_wsti_heatmap(
    sample_step: Optional[int] = Query(50, description="Sampling step size")
) -> Dict[str, Any]:
    """获取L3 WSTI热力图数据"""
    try:
        wsti_data = tempo_l3_service.get_wsti_heatmap_data(sample_step)
        return wsti_data
    except Exception as e:
        logger.error(f"Error getting L3 WSTI heatmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get L3 WSTI heatmap: {str(e)}")
