"""
Temperature Service using Google Earth Engine
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import ee
from app.models.weather_data import (
    TemperatureData,
    TemperatureDataResponse,
)

try:
    ee.Initialize(project="deft-scope-474021-g6")
    print("Successfully initialized Earth Engine for Temperature Service")
except Exception as e:
    print(f"Error initializing Earth Engine: {e}")


class TemperatureService:
    """使用 Google Earth Engine 获取温度数据"""

    def get_current_temperature_by_location(
        self, longitude: float, latitude: float
    ) -> dict:
        """
        获取指定位置的当前温度（使用 ECMWF 近实时预报数据）

        Args:
            longitude: 经度
            latitude: 纬度

        Returns:
            dict: 包含温度数据和元数据的字典
        """
        try:
            # 定义位置点
            location = ee.Geometry.Point([longitude, latitude])

            # 获取 ECMWF 近实时 IFS 大气预报数据集
            # 数据集ID: 'ECMWF/NRT_FORECAST/IFS/OPER'
            # 这是一个全球数据集，每天运行4次
            ecmwf_collection = ee.ImageCollection("ECMWF/NRT_FORECAST/IFS/OPER")

            # 获取最近24小时内的数据，并选择最新的一张影像
            # 'system:time_start' 在该数据集中代表模型运行时间
            now = datetime.now()
            start_time = now - timedelta(hours=24)
            latest_image = ecmwf_collection.filterDate(start_time, now).sort(
                "system:time_start", False
            ).first()

            # 检查是否获取到数据
            image_info = latest_image.getInfo()
            if not image_info:
                raise ValueError(
                    "没有找到最近的 ECMWF 预报影像。数据可能存在延迟或不可用。"
                )

            # 提取气温信息
            temperature_image = latest_image.select("temperature_2m_sfc")

            # 在指定位置点获取气温（单位为开尔文）
            temperature_celsius = (
                temperature_image.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=location,
                    scale=27830,  # ECMWF 数据的分辨率，约 27.8 公里
                )
                .get("temperature_2m_sfc")
                .getInfo()
            )

            # 获取影像时间戳
            image_timestamp = image_info.get("properties", {}).get("system:time_start")
            if image_timestamp:
                image_datetime = datetime.fromtimestamp(image_timestamp / 1000)
                timestamp_str = image_datetime.strftime("%Y-%m-%dT%H:%M:%SZ")
            else:
                timestamp_str = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")


            temperature_data = TemperatureData(
                longitude=longitude,
                latitude=latitude,
                timestamp=timestamp_str,
                temperature=round(temperature_celsius, 2),
            )

            metadata = {
                "source": "ECMWF Near-Realtime IFS Atmospheric Forecasts",
                "description": "2m air temperature from ECMWF forecast model",
                "unit": "Celsius",
                "band": "temperature_2m_sfc (2m air temperature)",
                "resolution": "~27.8km",
                "coverage": "Global",
                "update_frequency": "Twice daily",
                "note": "Temperature converted from Kelvin to Celsius",
            }   
            # 构建返回数据
            return TemperatureDataResponse(
                data=[temperature_data],
                metadata=metadata
            )

        except Exception as e:
            raise Exception(f"Failed to fetch current temperature: {str(e)}")


# Create service instance
temperature_service = TemperatureService()
