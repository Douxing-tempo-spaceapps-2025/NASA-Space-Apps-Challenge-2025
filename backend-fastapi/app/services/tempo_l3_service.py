"""
TEMPO L3 Data Service
专门用于处理TEMPO L3数据的服务
"""

import os
import logging
import h5py
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import earthaccess
from app.services.earthdata_service import earthdata_service

logger = logging.getLogger(__name__)

class TempoL3Service:
    """Service for fetching TEMPO L3 satellite data"""

    # TEMPO L3 data products
    COLLECTIONS = {
        "hcho": "TEMPO_HCHO_L3",   # Formaldehyde L3
        "no2": "TEMPO_NO2_L3",     # Nitrogen Dioxide L3
        "aerosol": "TEMPO_O3TOT_L3",  # UV Aerosol Index L3
    }
    
    # Provider for TEMPO data
    PROVIDER = "LARC_CLOUD"
    
    def __init__(self, hours_back: int = 6):
        self.hours_back = hours_back

    def get_latest_data(self, product: str, hours_back: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        获取最新的TEMPO L3数据
        
        Args:
            product: 产品类型 (hcho, no2, aerosol)
            hours_back: 搜索时间范围（小时）
            
        Returns:
            搜索结果列表
        """
        try:
            if product not in self.COLLECTIONS:
                logger.error(f"Unknown product: {product}")
                return []

            collection_id = self.COLLECTIONS[product]
            
            # 确保认证
            if not earthdata_service.ensure_authenticated():
                logger.error("Failed to authenticate with Earthdata")
                return []

            # 计算时间范围
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=hours_back or self.hours_back)

            logger.info(f"Searching for TEMPO L3 {product} data ({collection_id}) from {start_time} to {end_time}")

            # 搜索L3数据
            results = earthaccess.search_data(
                short_name=collection_id,
                provider=self.PROVIDER,
                temporal=(start_time, end_time),
                bounding_box=(-125, 24, -66.5, 50),  # Continental US
                count=5  # 获取更多L3文件
            )
            
            # 如果没找到数据，扩展搜索范围
            if not results:
                logger.warning(f"No L3 data found in {hours_back or self.hours_back} hours, expanding search range...")
                
                # 扩展到24小时
                expanded_start_time = end_time - timedelta(hours=24)
                logger.info(f"Expanding search to 24 hours: {expanded_start_time} to {end_time}")
                
                results = earthaccess.search_data(
                    short_name=collection_id,
                    provider=self.PROVIDER,
                    temporal=(expanded_start_time, end_time),
                    bounding_box=(-125, 24, -66.5, 50),
                    count=5
                )
                
                if results:
                    logger.info(f"Found L3 data in expanded 24-hour range")
                else:
                    # 扩展到48小时
                    logger.warning("No L3 data in 24 hours, expanding to 48 hours...")
                    expanded_start_time = end_time - timedelta(hours=48)
                    logger.info(f"Expanding search to 48 hours: {expanded_start_time} to {end_time}")
                    
                    results = earthaccess.search_data(
                        short_name=collection_id,
                        provider=self.PROVIDER,
                        temporal=(expanded_start_time, end_time),
                        bounding_box=(-125, 24, -66.5, 50),
                        count=5
                    )
                    
                    if results:
                        logger.info(f"Found L3 data in expanded 48-hour range")
                    else:
                        logger.warning("No L3 data found even in 48-hour range")

            logger.info(f"Found {len(results)} TEMPO L3 {product} files")
            return results

        except Exception as e:
            logger.error(f"Error searching for TEMPO L3 data: {e}")
            return []

    def get_data_files(self, results: List[Dict[str, Any]], product: str, hours_back: int) -> List[str]:
        """
        下载L3数据文件并返回本地文件路径
        
        Args:
            results: 搜索结果
            product: 产品类型
            hours_back: 搜索时间范围
            
        Returns:
            本地文件路径列表
        """
        try:
            if not results:
                logger.warning("No L3 data files to download")
                return []

            downloaded_files = []
            
            for result in results:
                granule_ur = result.get('umm', {}).get('GranuleUR', '')
                production_time = result.get('umm', {}).get('ProductionDateTime', '')
                
                file_path = f"./temp_data/{granule_ur}"
                
                # 总是下载最新数据
                if not os.path.exists(file_path):
                    logger.info(f"Downloading L3 file: {granule_ur}")
                    try:
                        # 确保认证
                        if not earthdata_service.ensure_authenticated():
                            logger.error("Failed to authenticate for download")
                            continue
                        
                        # 创建temp_data目录
                        os.makedirs("./temp_data", exist_ok=True)
                        
                        # 下载文件
                        files = earthaccess.download([result], local_path="./temp_data")
                        if files:
                            downloaded_files.extend(files)
                            logger.info(f"Successfully downloaded L3 file: {granule_ur}")
                        else:
                            logger.warning(f"Failed to download L3 file: {granule_ur}")
                    except Exception as e:
                        logger.error(f"Error downloading L3 file {granule_ur}: {e}")
                else:
                    logger.info(f"L3 file already exists: {granule_ur}")
                    downloaded_files.append(file_path)
            
            # 清理旧文件
            self.cleanup_old_files(product)
            
            logger.info(f"Total L3 files available: {len(downloaded_files)}")
            return downloaded_files

        except Exception as e:
            logger.error(f"Error downloading TEMPO L3 data: {e}")
            return []

    def cleanup_old_files(self, product: str):
        """清理旧的L3文件以节省磁盘空间"""
        try:
            temp_dir = "./temp_data"
            if not os.path.exists(temp_dir):
                return
            
            # 获取该产品的所有文件
            pattern = f"TEMPO_{product.upper()}_L3_*.nc"
            import glob
            files = glob.glob(os.path.join(temp_dir, pattern))
            
            if len(files) <= 3:  # 保留至少3个文件
                return
            
            # 按修改时间排序（最旧的在前）
            files.sort(key=lambda x: os.path.getmtime(x))
            
            # 删除最旧的文件，只保留最新的3个
            files_to_remove = files[:-3]
            for file_path in files_to_remove:
                try:
                    os.remove(file_path)
                    logger.info(f"Cleaned up old L3 file: {os.path.basename(file_path)}")
                except Exception as e:
                    logger.warning(f"Failed to remove {file_path}: {e}")
                    
        except Exception as e:
            logger.error(f"Error cleaning up old L3 files: {e}")

    def get_heatmap_data(self, product: str, sample_step: int = 20) -> List[Dict[str, Any]]:
        """
        使用Harmony获取L3热力图数据
        
        Args:
            product: 产品类型
            sample_step: 采样步长
            
        Returns:
            热力图数据点列表
        """
        try:
            import xarray as xr
            from harmony import BBox, Client, Collection, Request
            from harmony.config import Environment
            import getpass
            import os
            
            # 确保认证
            earthdata_service.ensure_authenticated()
            
            # 获取认证信息 - 使用环境变量或默认值
            username = os.getenv('EARTHDATA_USER', 'joeyhuang')
            password = os.getenv('EARTHDATA_PASS', '')
            
            if not username or not password:
                logger.error("Earthdata credentials not found in environment variables")
                return []
            
            # 创建Harmony客户端
            harmony_client = Client(env=Environment.PROD, auth=(username, password))
            
            # 根据产品类型选择Collection ID (使用最新L3数据)
            collection_ids = {
                'hcho': 'C3685668680-LARC_CLOUD',   # TEMPO_HCHO_L3_NRT_V02 (实时数据)
                'no2': 'C2930725014-LARC_CLOUD',    # TEMPO_NO2_L2 (暂时使用L2)
                'aerosol': 'C2930730944-LARC_CLOUD'  # 使用HCHO的collection
            }
            
            collection_id = collection_ids.get(product)
            if not collection_id:
                logger.error(f"Unknown product: {product}")
                return []
            
            # 创建Harmony请求（指定24小时时间范围）
            request = Request(
                collection=Collection(id=collection_id),
                spatial=BBox(-125, 24, -66.5, 50),  # 美国范围
                temporal={
                    "start": datetime.now() - timedelta(hours=24),
                    "stop": datetime.now()
                }
            )
            
            logger.info(f"Submitting Harmony request for {product}")
            job_id = harmony_client.submit(request)
            logger.info(f"Harmony job ID: {job_id}")
            
            # 等待处理完成
            harmony_client.wait_for_processing(job_id, show_progress=True)
            
            # 下载结果
            results = harmony_client.download_all(job_id, directory="/tmp", overwrite=True)
            all_results_stored = [f.result() for f in results]
            
            if not all_results_stored:
                logger.warning(f"No L3 data files downloaded for {product}")
                return []
            
            logger.info(f"Downloaded {len(all_results_stored)} L3 files")
            
            # 处理第一个文件
            file_path = all_results_stored[0]
            logger.info(f"Processing L3 file: {os.path.basename(file_path)}")
            
            # 使用xarray打开数据
            datatree = xr.open_datatree(file_path)
            
            logger.info(f"Data tree structure: {list(datatree.keys())}")
            
            # 获取数据组
            product_group = datatree['product']
            geo_group = datatree['geolocation']
            
            logger.info(f"Product variables: {list(product_group.keys())}")
            logger.info(f"Geo variables: {list(geo_group.keys())}")
            
            # 根据产品类型选择变量名
            var_name = 'vertical_column'
            if product == 'no2':
                var_name = 'vertical_column_troposphere'
            elif product == 'aerosol':
                var_name = 'aerosol_index'
            
            # 获取数据
            data = product_group[var_name].values
            lat_data = geo_group['latitude'].values
            lon_data = geo_group['longitude'].values
            
            logger.info(f"Data shape: {data.shape}")
            logger.info(f"Lat shape: {lat_data.shape}")
            logger.info(f"Lon shape: {lon_data.shape}")
            
            # L3数据是3维的，需要处理
            if len(data.shape) == 3:
                data = data[0]  # 取第一个时间步
                logger.info(f"Taking first time step, new shape: {data.shape}")
            
            # L3数据的坐标是1维的，需要创建网格
            lat_grid, lon_grid = np.meshgrid(lat_data, lon_data, indexing='ij')
            logger.info(f"Grid shapes: lat_grid={lat_grid.shape}, lon_grid={lon_grid.shape}")
            
            heatmap_data = []
            
            # 采样数据
            step = sample_step
            for i in range(0, lat_grid.shape[0], step):
                for j in range(0, lat_grid.shape[1], step):
                    if i < lat_grid.shape[0] and j < lat_grid.shape[1]:
                        lat = float(lat_grid[i, j])
                        lon = float(lon_grid[i, j])
                        
                        # 检查是否在美国范围内
                        if 24 <= lat <= 50 and -125 <= lon <= -66.5:
                            # 获取数据值
                            if data.ndim == 2:
                                value = float(data[i, j])
                            else:
                                value = float(data[i, j, 0]) if data.ndim == 3 else float(data[i, j])
                            
                            # 跳过无效值
                            if not np.isnan(value) and not np.isinf(value):
                                heatmap_data.append({
                                    'latitude': lat,
                                    'longitude': lon,
                                    'value': value,
                                    'product': product
                                })
            
            logger.info(f"Generated {len(heatmap_data)} L3 heatmap points for {product} via Harmony")
            return heatmap_data

        except Exception as e:
            logger.error(f"Error getting L3 heatmap data via Harmony: {e}")
            return []

    def get_wsti_heatmap_data(self, sample_step: int = 20) -> Dict[str, Any]:
        """
        获取WSTI热力图数据（使用L3数据）
        
        Args:
            sample_step: 采样步长
            
        Returns:
            WSTI热力图数据
        """
        try:
            logger.info("Generating WSTI heatmap data using L3 data...")
            
            # 获取所有产品的L3数据
            hcho_data = self.get_heatmap_data("hcho", sample_step)
            no2_data = self.get_heatmap_data("no2", sample_step)
            aerosol_data = self.get_heatmap_data("aerosol", sample_step)
            
            if not hcho_data or not no2_data or not aerosol_data:
                logger.warning("Missing L3 data for WSTI calculation")
                return {
                    "heatmap_data": [],
                    "total_points": 0,
                    "data_age_hours": 0,
                    "search_range_hours": 24,
                    "message": "Insufficient L3 data for WSTI calculation"
                }
            
            # 创建位置到数据的映射
            def create_location_map(data_list):
                location_map = {}
                for point in data_list:
                    key = (round(point['latitude'], 2), round(point['longitude'], 2))
                    location_map[key] = point['value']
                return location_map
            
            hcho_map = create_location_map(hcho_data)
            no2_map = create_location_map(no2_data)
            aerosol_map = create_location_map(aerosol_data)
            
            # 计算WSTI
            from app.services.wsti_calculator import WSTICalculator
            calculator = WSTICalculator()
            
            wsti_data = []
            all_locations = set(hcho_map.keys()) | set(no2_map.keys()) | set(aerosol_map.keys())
            
            for lat, lon in all_locations:
                hcho = hcho_map.get((lat, lon), 0)
                no2 = no2_map.get((lat, lon), 0)
                aerosol = aerosol_map.get((lat, lon), 0)
                
                # 计算WSTI
                threat_score, level, color = calculator.calculate_wsti(hcho, aerosol, no2)
                
                wsti_data.append({
                    'latitude': lat,
                    'longitude': lon,
                    'threat_score': threat_score,
                    'level': level,
                    'color': color,
                    'hcho': hcho,
                    'aerosol': aerosol,
                    'no2': no2
                })
            
            logger.info(f"Generated WSTI heatmap with {len(wsti_data)} points using L3 data")
            
            return {
                "heatmap_data": wsti_data,
                "total_points": len(wsti_data),
                "data_age_hours": 24,
                "search_range_hours": 24,
                "message": f"Generated WSTI threat assessment for {len(wsti_data)} locations using L3 data"
            }
            
        except Exception as e:
            logger.error(f"Error generating WSTI heatmap with L3 data: {e}")
            return {
                "heatmap_data": [],
                "total_points": 0,
                "data_age_hours": 0,
                "search_range_hours": 24,
                "message": f"Error generating WSTI data: {str(e)}"
            }
