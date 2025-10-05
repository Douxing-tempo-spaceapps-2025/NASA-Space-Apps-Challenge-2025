"""
Precipitation Service using earthaccess library
"""

import os
import tempfile
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import earthaccess
import numpy as np
from app.models.weather_data import PrecipitationData, PrecipitationDataResponse
from app.core.config import settings
import h5py
import re


import ee
import datetime

try:
    ee.Initialize(project="deft-scope-474021-g6")
    print("Successfully initialized Earth Engine")
except Exception as e:
    print(e)


class PrecipitationService:
    """获取NASA降水数据"""

    def get_current_precipitation_by_location(
        self, longitude: float, latitude: float
    ) -> PrecipitationDataResponse:
        """
        获取指定位置的当前降水量（最近1天累计）

        Args:
            longitude: 经度
            latitude: 纬度

        Returns:
            PrecipitationDataResponse: 包含降水量数据和元数据的响应对象
        """
        try:
            # 定义位置点
            location = ee.Geometry.Point([longitude, latitude])

            # 获取最近1天的降水数据
            now = datetime.datetime.now()
            start_time = now - datetime.timedelta(days=1)
            start_date_str = start_time.strftime("%Y-%m-%d")
            end_date_str = now.strftime("%Y-%m-%d")

            # 获取 NASA GPM IMERG 降水数据集
            # 半小时间隔的全球降水数据
            collection = (
                ee.ImageCollection("NASA/GPM_L3/IMERG_V07")
                .filterDate(start_date_str, end_date_str)
                .filterBounds(location)
                .select("precipitation")
            )

            # 检查是否获取到数据
            size = collection.size().getInfo()
            if size == 0:
                raise ValueError(
                    f"没有找到最近1天的降水数据。数据可能存在延迟或不可用。"
                )

            # 计算总降水量
            total_precipitation = collection.sum()

            # 在指定位置点获取降水量（单位：mm）
            precipitation_mm = (
                total_precipitation.reduceRegion(
                    reducer=ee.Reducer.first(),
                    geometry=location,
                    scale=11132,  # GPM IMERG 数据的分辨率，约 11 公里
                )
                .get("precipitation")
                .getInfo()
            )

            if precipitation_mm is None:
                raise ValueError("无法获取指定位置的降水数据。请检查经纬度是否有效。")

            # 创建 PrecipitationData 对象
            precipitation_data = PrecipitationData(
                longitude=longitude,
                latitude=latitude,
                timestamp=now.strftime("%Y-%m-%dT%H:%M:%SZ"),
                precipitation=[round(precipitation_mm, 2)],  # 作为列表
            )

            # 构建元数据
            metadata = {
                "source": "NASA GPM IMERG V07",
                "description": "Total precipitation accumulated over the past 1 day",
                "unit": "mm",
                "resolution": "~11km",
                "coverage": "Global (60°N - 60°S)",
                "update_frequency": "Every 30 minutes",
                "time_range": {
                    "start": start_date_str,
                    "end": end_date_str,
                    "days": 1,
                },
                "note": "Cumulative precipitation from half-hourly measurements",
            }

            # 返回 PrecipitationDataResponse 对象
            return PrecipitationDataResponse(
                data=[precipitation_data], metadata=metadata
            )

        except Exception as e:
            raise Exception(f"Failed to fetch current precipitation: {str(e)}")

    def get_precipitation_data_by_location(
        self,
        longitude: float,
        latitude: float,
        start_date_str: str,
        end_date_str: str,
    ):
        """
        根据经纬度获取降水数据
        """
        point = ee.Geometry.Point([longitude, latitude])

        collection = (
            ee.ImageCollection("NASA/GPM_L3/IMERG_V07")
            .filterDate(start_date_str, end_date_str)
            .filterBounds(point)
            .select("precipitation")
        )

        size = collection.size().getInfo()
        if size == 0:
            raise ValueError(
                f"No precipitation data found for {start_date_str} to {end_date_str} at {longitude}, {latitude}"
            )

        total_precipitation = collection.sum()

        result = (
            total_precipitation.reduceRegion(
                reducer=ee.Reducer.first(),
                geometry=point,
                scale=11132,
            )
            .get("precipitation")
            .getInfo()
        )

        return result


# Create service instance
precipitation_service = PrecipitationService()
