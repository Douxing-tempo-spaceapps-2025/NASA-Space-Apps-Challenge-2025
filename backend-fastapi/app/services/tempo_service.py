"""
TEMPO Data Service
Service to fetch TEMPO satellite data for HCHO, NO2, and Aerosol Index
"""
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import earthaccess
import numpy as np
from app.services.earthdata_service import earthdata_service
from app.services.wsti_calculator import calculate_wsti_for_points

logger = logging.getLogger(__name__)


class TempoService:
    """Service for fetching TEMPO satellite data"""

    # Available TEMPO data products (updated with correct names and provider)
    COLLECTIONS = {
        "hcho": "TEMPO_HCHO_L2",   # Formaldehyde
        "no2": "TEMPO_NO2_L2",     # Nitrogen Dioxide
        "aerosol": "TEMPO_O3TOT_L2",  # UV Aerosol Index (from O3 Total Column product)
    }
    
    # Provider for TEMPO data
    PROVIDER = "LARC_CLOUD"

    

    def __init__(self, hours_back: int = 6):
        self.hours_back = hours_back

    def get_latest_data(self, product: str, hours_back: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get latest TEMPO data for a given product within specified hours

        Args:
            product: "hcho" | "no2" | "aerosol"
            hours_back: Hours to look back, uses instance default if None

        Returns:
            List of granule metadata
        """
        try:
            # Check if product is valid
            if product not in self.COLLECTIONS:
                logger.error(f"Unsupported product: {product}")
                return []

            # Always search for latest data for real-time updates
            logger.info(f"Searching for latest {product} data (no cache)")

            collection_id = self.COLLECTIONS[product]

            # Ensure authentication
            if not earthdata_service.ensure_authenticated():
                logger.error("Failed to authenticate with Earthdata")
                return []

            # Calculate time range with intelligent expansion
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=hours_back or self.hours_back)

            logger.info(f"Searching for TEMPO {product} data ({collection_id}) from {start_time} to {end_time}")

            # Search for data using the correct provider and version
            results = earthaccess.search_data(
                short_name=collection_id,
                version="V04",  # Use V04 version for latest data
                provider=self.PROVIDER,
                temporal=(start_time, end_time),
                bounding_box=(-125, 24, -66.5, 50),  # Continental US
                count=10  # Get more files for better coverage
            )
            
            # If no data found in initial range, expand search range
            if not results:
                logger.warning(f"No data found in {hours_back or self.hours_back} hours, expanding search range...")
                
                # Expand to 12 hours
                expanded_start_time = end_time - timedelta(hours=12)
                logger.info(f"Expanding search to 12 hours: {expanded_start_time} to {end_time}")
                
                results = earthaccess.search_data(
                    short_name=collection_id,
                    version="V04",
                    provider=self.PROVIDER,
                    temporal=(expanded_start_time, end_time),
                    bounding_box=(-125, 24, -66.5, 50),
                    count=10
                )
                
                if results:
                    logger.info(f"Found data in expanded 12-hour range")
                else:
                    # If still no data, expand to 24 hours
                    logger.warning("No data in 12 hours, expanding to 24 hours...")
                    expanded_start_time = end_time - timedelta(hours=24)
                    logger.info(f"Expanding search to 24 hours: {expanded_start_time} to {end_time}")
                    
                    results = earthaccess.search_data(
                        short_name=collection_id,
                        version="V04",
                        provider=self.PROVIDER,
                        temporal=(expanded_start_time, end_time),
                        bounding_box=(-125, 24, -66.5, 50),
                        count=10
                    )
                    
                    if results:
                        logger.info(f"Found data in expanded 24-hour range")
                    else:
                        logger.warning("No data found even in 24-hour range")

            logger.info(f"Found {len(results)} TEMPO {product} files")
            
            # No caching for real-time data
            return results

        except Exception as e:
            logger.error(f"Error fetching TEMPO {product} data: {e}")
            return []

    def get_data_files(self, results: List[Dict[str, Any]], product: str, hours_back: int) -> List[str]:
        """
        Download data files and return local file paths
        Always ensures latest data for real-time processing

        Args:
            results: Search results from get_latest_data
            product: Product type
            hours_back: Hours back for data

        Returns:
            List of local file paths
        """
        try:
            if not results:
                logger.warning("No data files to download")
                return []

            downloaded_files = []
            
            for result in results:
                # Get file metadata
                granule_ur = result.get('umm', {}).get('GranuleUR', '')
                production_time = result.get('umm', {}).get('ProductionDateTime', '')
                
                file_path = f"./temp_data/{granule_ur}"
                
                # Always download latest (simplest and most reliable)
                if not os.path.exists(file_path):
                    logger.info(f"Downloading new file: {granule_ur}")
                    try:
                        # Ensure authentication
                        if not earthdata_service.ensure_authenticated():
                            logger.error("Failed to authenticate for download")
                            continue
                        
                        # Create temp_data directory if it doesn't exist
                        os.makedirs("./temp_data", exist_ok=True)
                        
                        # Download file
                        files = earthaccess.download([result], local_path="./temp_data")
                        if files:
                            downloaded_files.extend(files)
                            logger.info(f"Successfully downloaded: {granule_ur}")
                        else:
                            logger.warning(f"Failed to download: {granule_ur}")
                    except Exception as e:
                        logger.error(f"Error downloading {granule_ur}: {e}")
                else:
                    logger.info(f"File already exists and is latest: {granule_ur}")
                    downloaded_files.append(file_path)
            
            # Clean up old files to save space
            self.cleanup_old_files(product)
            
            logger.info(f"Total files available: {len(downloaded_files)}")
            return downloaded_files

        except Exception as e:
            logger.error(f"Error downloading TEMPO data: {e}")
            return []

    def cleanup_old_files(self, product: str):
        """Clean up old files to save disk space"""
        try:
            temp_dir = "./temp_data"
            if not os.path.exists(temp_dir):
                return
            
            # Get all files for this product
            pattern = f"TEMPO_{product.upper()}_L2_*.nc"
            import glob
            files = glob.glob(os.path.join(temp_dir, pattern))
            
            if len(files) <= 3:  # Keep at least 3 files
                return
            
            # Sort by modification time (oldest first)
            files.sort(key=lambda x: os.path.getmtime(x))
            
            # Remove oldest files, keep only the 3 most recent
            files_to_remove = files[:-3]
            for file_path in files_to_remove:
                try:
                    os.remove(file_path)
                    logger.info(f"Cleaned up old file: {os.path.basename(file_path)}")
                except Exception as e:
                    logger.warning(f"Failed to remove {file_path}: {e}")
                    
        except Exception as e:
            logger.error(f"Error cleaning up old files: {e}")



    def parse_data_file(self, file_path: str, product: str) -> Optional[Dict[str, Any]]:
        """
        Parse a single TEMPO data file and extract relevant data using direct HDF5 access
        
        Args:
            file_path: Path to the data file
            product: Product type (hcho, no2, aerosol)
            
        Returns:
            Dictionary containing parsed data or None if failed
        """
        try:
            if not os.path.exists(file_path):
                logger.error(f"File not found: {file_path}")
                return None
            
            logger.info(f"Parsing file: {file_path}")
            
            # Use direct HDF5 access for TEMPO data
            import h5py
            with h5py.File(file_path, 'r') as f:
                # Check if required groups exist
                if 'product' not in f or 'geolocation' not in f:
                    logger.error("Required HDF5 groups (product, geolocation) not found")
                    return None
                
                # Get data variable based on product
                if product == 'hcho':
                    if 'vertical_column' not in f['product']:
                        logger.error("vertical_column not found in product group")
                        return None
                    
                    # Get HCHO data
                    values = f['product']['vertical_column'][:]
                    var_name = "product/vertical_column"
                    
                elif product == 'no2':
                    # NO2 uses different variable names
                    if 'vertical_column_troposphere' in f['product']:
                        values = f['product']['vertical_column_troposphere'][:]
                        var_name = "product/vertical_column_troposphere"
                    elif 'vertical_column' in f['product']:
                        values = f['product']['vertical_column'][:]
                        var_name = "product/vertical_column"
                    else:
                        logger.error("No NO2 vertical column found in product group")
                        return None
                elif product == 'aerosol':
                    # Aerosol Index from O3 Total Column product
                    if 'uv_aerosol_index' in f['product']:
                        values = f['product']['uv_aerosol_index'][:]
                        var_name = "product/uv_aerosol_index"
                    else:
                        logger.error("uv_aerosol_index not found in product group")
                        return None
                else:
                    logger.error(f"Unsupported product: {product}")
                    return None
                
                # Get coordinates
                if 'longitude' not in f['geolocation'] or 'latitude' not in f['geolocation']:
                    logger.error("Longitude/latitude not found in geolocation group")
                    return None
                
                lon = f['geolocation']['longitude'][:]
                lat = f['geolocation']['latitude'][:]
                
                # Get time information
                time_info = None
                if 'time' in f['geolocation']:
                    time_info = f['geolocation']['time'][:]
                
                # Handle fill values (-1e30 is the fill value for TEMPO data)
                fill_value = -1e30
                values = np.where(values == fill_value, np.nan, values)
                
                logger.info(f"Extracted {product} data: shape={values.shape}, valid_points={np.sum(~np.isnan(values))}")
                
                return {
                    'product': product,
                    'variable_name': var_name,
                    'longitude': lon,
                    'latitude': lat,
                    'values': values,
                    'time': time_info,
                    'file_path': file_path,
                    'shape': values.shape,
                    'dimensions': ('mirror_step', 'xtrack')  # TEMPO L2 dimensions
                }
                
        except Exception as e:
            logger.error(f"Error parsing file {file_path}: {e}")
            import traceback
            traceback.print_exc()
            return None

    def parse_multiple_files(self, file_paths: List[str], product: str) -> List[Dict[str, Any]]:
        """
        Parse multiple TEMPO data files
        
        Args:
            file_paths: List of file paths
            product: Product type
            
        Returns:
            List of parsed data dictionaries
        """
        parsed_data = []
        
        for file_path in file_paths:
            data = self.parse_data_file(file_path, product)
            if data:
                parsed_data.append(data)
        
        logger.info(f"Successfully parsed {len(parsed_data)} out of {len(file_paths)} files")
        return parsed_data

    def get_heatmap_data(self, file_paths: List[str], product: str, sample_step: int = 20) -> List[Dict[str, Any]]:
        """
        Process data files and return heatmap-ready data with sampling
        
        Args:
            file_paths: List of downloaded file paths
            product: Product type
            sample_step: Sampling step size to reduce data points (default: 20)
            
        Returns:
            List of data points suitable for heatmap visualization
        """
        try:
            # Parse all files
            parsed_data = self.parse_multiple_files(file_paths, product)
            
            if not parsed_data:
                logger.warning("No data could be parsed from files")
                return []
            
            heatmap_points = []
            
            for data in parsed_data:
                lon = data['longitude']
                lat = data['latitude']
                values = data['values']
                dimensions = data['dimensions']
                
                logger.info(f"Processing data with shape: {values.shape}, dimensions: {dimensions}")
                
                # Handle different data structures
                if len(values.shape) == 1:  # 1D data (scan line)
                    # Direct mapping for 1D data
                    for i in range(len(values)):
                        if not np.isnan(values[i]) and i < len(lon) and i < len(lat):
                            heatmap_points.append({
                                'longitude': float(lon[i]),
                                'latitude': float(lat[i]),
                                'value': float(values[i]),
                                'product': product
                            })
                
                elif len(values.shape) == 2:  # 2D data
                    # Handle 2D data with proper indexing and sampling
                    if 'time' in dimensions and 'xtrack' in dimensions:
                        # TEMPO scan line data: (time, xtrack) with sampling
                        for t in range(0, values.shape[0], sample_step):
                            for x in range(0, values.shape[1], sample_step):
                                if not np.isnan(values[t, x]):
                                    # For scan line data, coordinates might be 2D too
                                    if len(lon.shape) == 2 and len(lat.shape) == 2:
                                        heatmap_points.append({
                                            'longitude': float(lon[t, x]),
                                            'latitude': float(lat[t, x]),
                                            'value': float(values[t, x]),
                                            'product': product
                                        })
                                    else:
                                        # If coordinates are 1D, use xtrack index
                                        if x < len(lon) and x < len(lat):
                                            heatmap_points.append({
                                                'longitude': float(lon[x]),
                                                'latitude': float(lat[x]),
                                                'value': float(values[t, x]),
                                                'product': product
                                            })
                    else:
                        # Regular 2D grid data with sampling
                        for i in range(0, values.shape[0], sample_step):
                            for j in range(0, values.shape[1], sample_step):
                                if not np.isnan(values[i, j]):
                                    if len(lon.shape) == 2 and len(lat.shape) == 2:
                                        heatmap_points.append({
                                            'longitude': float(lon[i, j]),
                                            'latitude': float(lat[i, j]),
                                            'value': float(values[i, j]),
                                            'product': product
                                        })
                                    else:
                                        # If coordinates are 1D, use indices
                                        if i < len(lon) and j < len(lat):
                                            heatmap_points.append({
                                                'longitude': float(lon[i]),
                                                'latitude': float(lat[j]),
                                                'value': float(values[i, j]),
                                                'product': product
                                            })
                
                elif len(values.shape) == 3:  # 3D data (time, lat, lon) with sampling
                    # Take the latest time step or average with sampling
                    latest_time = values.shape[0] - 1
                    for i in range(0, values.shape[1], sample_step):
                        for j in range(0, values.shape[2], sample_step):
                            if not np.isnan(values[latest_time, i, j]):
                                if len(lon.shape) == 2 and len(lat.shape) == 2:
                                    heatmap_points.append({
                                        'longitude': float(lon[i, j]),
                                        'latitude': float(lat[i, j]),
                                        'value': float(values[latest_time, i, j]),
                                        'product': product
                                    })
                                else:
                                    if i < len(lon) and j < len(lat):
                                        heatmap_points.append({
                                            'longitude': float(lon[i]),
                                            'latitude': float(lat[j]),
                                            'value': float(values[latest_time, i, j]),
                                            'product': product
                                        })
            
            logger.info(f"Generated {len(heatmap_points)} heatmap data points for {product}")
            return heatmap_points
            
        except Exception as e:
            logger.error(f"Error generating heatmap data: {e}")
            return []

    def get_wsti_heatmap_data(self, hours_back: Optional[int] = None, sample_step: int = 20) -> List[Dict[str, Any]]:
        """
        Generate WSTI (Wildfire Smoke Threat Index) heatmap data
        Combines HCHO, Aerosol Index, and NO2 data to calculate wildfire threat levels
        Generates real-time threat assessment data
        
        Args:
            hours_back: Hours to look back for data
            sample_step: Sampling step size to reduce data points (default: 20)
            
        Returns:
            List of threat assessment points for heatmap visualization
        """
        try:
            # Always get fresh data for real-time heatmap
            logger.info("Fetching fresh data for real-time WSTI heatmap")
            
            # Get data for available products (HCHO, NO2, and Aerosol)
            products = ['hcho', 'no2', 'aerosol']  # All three products are now supported
            all_data = {}
            
            for product in products:
                logger.info(f"Fetching {product} data for WSTI calculation")
                
                # Search for data
                results = self.get_latest_data(product, hours_back)
                if not results:
                    logger.warning(f"No {product} data found")
                    continue
                
                # Download files
                downloaded_files = self.get_data_files(results, product, hours_back or self.hours_back)
                if not downloaded_files:
                    logger.warning(f"Failed to download {product} files")
                    continue
                
                # Parse and process data with sampling
                heatmap_data = self.get_heatmap_data(downloaded_files, product, sample_step)
                all_data[product] = heatmap_data
                
                logger.info(f"Processed {len(heatmap_data)} {product} data points")
            
            # Check if we have required data (at least HCHO)
            if not all_data or 'hcho' not in all_data:
                logger.error("Insufficient data for WSTI calculation (need at least HCHO)")
                return []
            
            # Combine data points by location
            combined_points = self._combine_data_by_location(all_data)
            
            # Calculate WSTI scores
            wsti_points = calculate_wsti_for_points(combined_points)
            
            # No caching for real-time data
            logger.info(f"Generated {len(wsti_points)} real-time WSTI threat assessment points")
            return wsti_points
            
        except Exception as e:
            logger.error(f"Error generating WSTI heatmap data: {e}")
            return []

    def _combine_data_by_location(self, all_data: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """
        Combine data points from different products by geographic location
        
        Args:
            all_data: Dictionary with product data lists
            
        Returns:
            List of combined data points
        """
        combined_points = []
        
        # Use HCHO data as the base (most important for wildfire detection)
        base_data = all_data.get('hcho', [])
        
        for hcho_point in base_data:
            lat = hcho_point['latitude']
            lon = hcho_point['longitude']
            
            # Find corresponding points in other datasets
            aerosol_point = self._find_nearest_point(all_data.get('aerosol', []), lat, lon)
            no2_point = self._find_nearest_point(all_data.get('no2', []), lat, lon)
            
            # Create combined point
            combined_point = {
                'latitude': lat,
                'longitude': lon,
                'hcho': hcho_point['value'],
                'aerosol': aerosol_point['value'] if aerosol_point else 0.0,
                'no2': no2_point['value'] if no2_point else 0.0
            }
            
            combined_points.append(combined_point)
        
        return combined_points

    def _find_nearest_point(self, data_points: List[Dict[str, Any]], target_lat: float, target_lon: float, tolerance: float = 0.01) -> Optional[Dict[str, Any]]:
        """
        Find the nearest data point to a target location
        
        Args:
            data_points: List of data points to search
            target_lat: Target latitude
            target_lon: Target longitude
            tolerance: Maximum distance tolerance in degrees
            
        Returns:
            Nearest data point or None if not found
        """
        if not data_points:
            return None
        
        min_distance = float('inf')
        nearest_point = None
        
        for point in data_points:
            lat = point['latitude']
            lon = point['longitude']
            
            # Calculate simple distance (not great circle, but fast)
            distance = ((lat - target_lat) ** 2 + (lon - target_lon) ** 2) ** 0.5
            
            if distance < min_distance and distance <= tolerance:
                min_distance = distance
                nearest_point = point
        
        return nearest_point


# Global instance
tempo_service = TempoService()
