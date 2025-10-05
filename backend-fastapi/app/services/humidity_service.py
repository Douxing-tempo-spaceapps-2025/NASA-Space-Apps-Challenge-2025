"""
Humidity Service using Google Earth Engine
"""

from typing import Dict
from datetime import datetime, timedelta
import ee
import math
from app.models.weather_data import HumidityData, HumidityDataResponse

try:
    ee.Initialize(project="deft-scope-474021-g6")
    print("Successfully initialized Earth Engine for Humidity Service")
except Exception as e:
    print(f"Error initializing Earth Engine: {e}")


class HumidityService:
    """使用 Google Earth Engine 获取湿度数据"""

    def __init__(self):
        """初始化服务"""
        pass

    def get_current_humidity_by_location(
        self, longitude: float, latitude: float
    ) -> Dict:
        """
        获取指定位置的当前相对湿度（使用 ECMWF 近实时预报数据）

        Args:
            longitude: 经度
            latitude: 纬度

        Returns:
            dict: 包含相对湿度数据和元数据的字典
        """
        try:
            # 定义位置点
            location = ee.Geometry.Point([longitude, latitude])

            # 获取 ECMWF 近实时 IFS 大气预报数据集
            ecmwf_collection = ee.ImageCollection("ECMWF/NRT_FORECAST/IFS/OPER")

            # 获取最近24小时内的数据，并选择最新的一张影像
            now = datetime.now()
            start_time = now - timedelta(hours=24)
            latest_image = (
                ecmwf_collection.filterDate(start_time, now)
                .sort("system:time_start", False)
                .first()
            )

            # 检查是否获取到数据
            image_info = latest_image.getInfo()
            if not image_info:
                raise ValueError(
                    "没有找到最近的 ECMWF 预报影像。数据可能存在延迟或不可用。"
                )

            # 提取气温和露点温度波段
            temperature_image = latest_image.select("temperature_2m_sfc")
            dew_point_image = latest_image.select("dewpoint_temperature_2m_sfc")

            # 在指定位置点获取气温和露点温度（单位为开尔文）
            temp_celsius = (
                temperature_image.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=location,
                    scale=27830,  # ECMWF 数据的分辨率
                )
                .get("temperature_2m_sfc")
                .getInfo()
            )

            dew_point_celsius = (
                dew_point_image.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=location,
                    scale=27830,
                )
                .get("dewpoint_temperature_2m_sfc")
                .getInfo()
            )

            # 计算相对湿度（RH）
            # 使用 Magnus-Tetens 公式的一个简化版本
            exponent = (17.625 * dew_point_celsius) / (243.04 + dew_point_celsius) - (
                17.625 * temp_celsius
            ) / (243.04 + temp_celsius)
            relative_humidity = 100 * math.exp(exponent)

            # 获取影像时间戳
            image_timestamp = image_info.get("properties", {}).get("system:time_start")
            if image_timestamp:
                image_datetime = datetime.fromtimestamp(image_timestamp / 1000)
                timestamp_str = image_datetime.strftime("%Y-%m-%dT%H:%M:%SZ")
            else:
                timestamp_str = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
            
            humidity_data = HumidityData(
                longitude=longitude,
                latitude=latitude,
                timestamp=timestamp_str,
                relative_humidity=round(relative_humidity, 2),
                dew_point_celsius=round(dew_point_celsius, 2),
                temperature_celsius=round(temp_celsius, 2),
            )

            metadata = {
                "source": "ECMWF Near-Realtime IFS Atmospheric Forecasts",
                "description": "Relative humidity calculated from 2m air temperature and dewpoint",
                "unit": "%",
                "bands_used": ["temperature_2m_sfc", "dewpoint_temperature_2m_sfc"],
                "resolution": "~27.8km",
                "coverage": "Global",
                "update_frequency": "Twice daily",
            }
            
            # 构建返回数据
            return HumidityDataResponse(
                data=[humidity_data],
                metadata=metadata
            )

        except Exception as e:
            raise Exception(f"Failed to fetch humidity data: {str(e)}")


# Create service instance
humidity_service = HumidityService()
