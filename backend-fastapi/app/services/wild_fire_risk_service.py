"""
Wildfire Risk Index Service using Google Earth Engine
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
import ee
import math
from app.models.weather_data import FireRiskDataResponse

try:
    ee.Initialize(project="deft-scope-474021-g6")
    print("Successfully initialized Earth Engine for Wildfire Risk Service")
except Exception as e:
    print(f"Error initializing Earth Engine: {e}")


class WildfireRiskService:
    """使用 Google Earth Engine 计算火险指数"""

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

    def get_wildfire_risk_index_by_location(
        self, longitude: float, latitude: float
    ) -> Dict:
        """
        获取指定位置的火险指数

        Args:
            longitude: 经度
            latitude: 纬度

        Returns:
            Dict: 包含火险指数和元数据的字典
        """
        try:
            location = ee.Geometry.Point([longitude, latitude])
            latest_image = self._get_latest_ecmwf_image()

            if not latest_image:
                raise ValueError("没有找到最近的 ECMWF 预报影像。数据可能存在延迟或不可用。")

            # --- 1. 获取所有必需的波段 ---
            bands = [
                "temperature_2m_sfc",
                "dewpoint_temperature_2m_sfc",
                "u_component_of_wind_10m_sfc",
                "v_component_of_wind_10m_sfc",
                "total_precipitation_sfc",
            ]
            selected_image = latest_image.select(bands)

            # --- 2. 提取数据值 ---
            region_data = selected_image.reduceRegion(
                reducer=ee.Reducer.mean(), geometry=location, scale=27830
            ).getInfo()

            if not region_data:
                raise ValueError("无法获取指定位置的数据。请检查经纬度是否有效。")

            # --- 3. 计算各个气象指标 ---

            # a. 温度 (摄氏度)
            temp_celsius = region_data.get("temperature_2m_sfc")

            # b. 相对湿度 (%)
            dew_point_celsius = region_data.get("dewpoint_temperature_2m_sfc")

            exponent = (17.625 * dew_point_celsius) / (
                243.04 + dew_point_celsius
            ) - (17.625 * temp_celsius) / (243.04 + temp_celsius)
            humidity = 100 * math.exp(exponent)

            # c. 风速 (米/秒)
            wind_u = region_data.get("u_component_of_wind_10m_sfc")
            wind_v = region_data.get("v_component_of_wind_10m_sfc")
            wind_speed = (wind_u**2 + wind_v**2) ** 0.5

            # d. 降雨量 (千克/平方米，或毫米)
            precipitation = region_data.get("total_precipitation_sfc")

            # --- 4. 计算火险指数 ---
            # Risk = w1*Temp - w2*Humidity + w3*WindSpeed - w4*Precipitation
            # 权重: w1=0.5, w2=0.4, w3=0.3, w4=0.2
            
            # 为了让指数更直观，我们将各个变量进行归一化或调整，使其在合理的范围内。
            # 这里我们使用一个简单的线性公式，不进行复杂归一化。
            # 可以通过调整权重来平衡不同变量的贡献。
            fire_risk_index = (
                0.5 * temp_celsius
                - 0.4 * humidity
                + 0.3 * wind_speed
                - 0.2 * precipitation
            )

            # --- 5. 构建返回数据 ---
            component_data = {
                "temperature": round(temp_celsius, 2),
                "humidity": round(humidity, 2),
                "wind_speed": round(wind_speed, 2),
                "precipitation": round(precipitation, 2),
            }

            metadata = {
                "source": "ECMWF NRT IFS",
                "description": "Wildfire risk index based on a custom formula",
                "unit": "Index Value",
                "formula": "Risk = 0.5*Temp(°C) - 0.4*Humidity(%) + 0.3*Wind(m/s) - 0.2*Precipitation(mm)",
                "resolution": "~27.8km",
                "coverage": "Global",
            }

            return FireRiskDataResponse(
                longitude=longitude,
                latitude=latitude,
                wildfire_risk_index=round(fire_risk_index, 2),
                component_data=component_data,
                metadata=metadata
            )

               
            

        except Exception as e:
            raise Exception(f"Failed to calculate wildfire risk index: {str(e)}")