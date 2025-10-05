"""
Wind Speed Service using Google Earth Engine
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
import ee
import math

try:
    ee.Initialize(project="deft-scope-474021-g6")
    print("Successfully initialized Earth Engine for Wind Service")
except Exception as e:
    print(f"Error initializing Earth Engine: {e}")


class WindService:
    """使用 Google Earth Engine 获取风速数据"""


    def _get_latest_ecmwf_image(self) -> Optional[ee.Image]:
        """获取最近一次 ECMWF 模型运行的影像"""
        try:
            ecmwf_collection = ee.ImageCollection("ECMWF/NRT_FORECAST/IFS/OPER")
            now = datetime.now()
            start_time = now - timedelta(hours=24)
            latest_image = (
                ecmwf_collection.filterDate(start_time, now)
                .sort("system:time_start", False)
                .first()
            )
            image_info = latest_image.getInfo()
            if not image_info:
                return None
            return latest_image
        except Exception:
            return None

    def get_current_wind_speed_by_location(
        self, longitude: float, latitude: float
    ) -> Dict:
        """
        获取指定位置的当前风速

        Args:
            longitude: 经度
            latitude: 纬度

        Returns:
            Dict: 包含风速数据和元数据的字典
        """
        try:
            location = ee.Geometry.Point([longitude, latitude])
            latest_image = self._get_latest_ecmwf_image()

            if not latest_image:
                raise ValueError("没有找到最近的 ECMWF 预报影像。数据可能存在延迟或不可用。")

            # 提取风速分量波段
            wind_u_image = latest_image.select("u_component_of_wind_10m_sfc")
            wind_v_image = latest_image.select("v_component_of_wind_10m_sfc")

            # 在指定位置点获取风速分量值
            wind_u = (
                wind_u_image.reduceRegion(
                    reducer=ee.Reducer.mean(), geometry=location, scale=27830
                )
                .get("u_component_of_wind_10m_sfc")
                .getInfo()
            )
            wind_v = (
                wind_v_image.reduceRegion(
                    reducer=ee.Reducer.mean(), geometry=location, scale=27830
                )
                .get("v_component_of_wind_10m_sfc")
                .getInfo()
            )

            if wind_u is None or wind_v is None:
                raise ValueError("无法获取指定位置的风速分量数据。")

            # 计算总风速 (Wind Speed = sqrt(u^2 + v^2))
            wind_speed = (wind_u**2 + wind_v**2) ** 0.5

            return {
                "latitude": latitude,
                "longitude": longitude,
                "wind_speed": round(wind_speed, 2),
                "metadata": {
                    "source": "ECMWF NRT IFS",
                    "description": "10m wind speed",
                    "unit": "m/s",
                    "resolution": "~27.8km",
                    "coverage": "Global",
                },
            }

        except Exception as e:
            raise Exception(f"Failed to fetch wind speed data: {str(e)}")

# Create service instance
wind_field_service = WindService()