"""
Wildfire Smoke Threat Index (WSTI) Calculator
Calculates wildfire threat levels based on TEMPO satellite data
"""
import numpy as np
from typing import Dict, Any, List, Tuple

# Normalization ranges for different atmospheric parameters
NORMALIZATION_RANGES = {
    'hcho': (5e15, 4.0e16),      # Formaldehyde column density (molecules/cm²)
    'aerosol': (-1.0, 5.0),      # Aerosol Index (dimensionless)
    'no2': (5e14, 1.5e16),       # Nitrogen Dioxide column density (molecules/cm²)
}

# Threshold values for activation and suppression calculations
THRESHOLDS = {
    'hcho_activation_low': 0.2,   # Lower threshold for HCHO activation
    'hcho_activation_high': 0.7,  # Upper threshold for HCHO activation
    'no2_suppression_low': 0.4,   # Lower threshold for NO2 suppression
    'no2_suppression_high': 0.8,  # Upper threshold for NO2 suppression
}

# Strength of NO2 suppression effect
NO2_SUPPRESSION_STRENGTH = 0.9


def clamp(value: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    """
    Clamp a value between min and max bounds
    
    Args:
        value: Input value to clamp
        min_val: Minimum allowed value
        max_val: Maximum allowed value
        
    Returns:
        Clamped value
    """
    return max(min_val, min(value, max_val))


def normalize(value: float, value_range: Tuple[float, float]) -> float:
    """
    Normalize a value to 0-1 range based on given range
    
    Args:
        value: Input value to normalize
        value_range: Tuple of (min_value, max_value) for normalization
        
    Returns:
        Normalized value between 0 and 1
    """
    min_val, max_val = value_range
    if (max_val - min_val) == 0:
        return 0.0
    return clamp((value - min_val) / (max_val - min_val))


def calculate_wsti(hcho_raw: float, aerosol_raw: float = None, no2_raw: float = None) -> float:
    """
    Calculate Wildfire Smoke Threat Index (WSTI)
    
    The WSTI combines atmospheric parameters:
    - HCHO (Formaldehyde): Indicates biomass burning
    - Aerosol Index: Indicates smoke/dust presence (optional, defaults to 0.5 if not available)
    - NO2 (Nitrogen Dioxide): Suppresses wildfire likelihood in urban areas
    
    Args:
        hcho_raw: Raw HCHO column density value
        aerosol_raw: Raw Aerosol Index value (optional, defaults to 0.5)
        no2_raw: Raw NO2 column density value (optional, defaults to 0.0)
        
    Returns:
        WSTI score (0-10 scale)
    """
    # Handle missing aerosol data (fallback to default if not available)
    if aerosol_raw is None:
        aerosol_raw = 0.5  # Default moderate aerosol value
    
    # Handle missing NO2 data
    if no2_raw is None:
        no2_raw = 0.0  # Default no NO2 suppression
    
    # Normalize all parameters to 0-1 range
    hcho_norm = normalize(hcho_raw, NORMALIZATION_RANGES['hcho'])
    aerosol_norm = normalize(aerosol_raw, NORMALIZATION_RANGES['aerosol'])
    no2_norm = normalize(no2_raw, NORMALIZATION_RANGES['no2'])
    
    # Calculate HCHO activation factor
    hcho_activation = clamp(
        (hcho_norm - THRESHOLDS['hcho_activation_low']) / 
        (THRESHOLDS['hcho_activation_high'] - THRESHOLDS['hcho_activation_low'])
    )
    
    # Calculate NO2 suppression factor
    suppression_factor = clamp(
        (no2_norm - THRESHOLDS['no2_suppression_low']) / 
        (THRESHOLDS['no2_suppression_high'] - THRESHOLDS['no2_suppression_low'])
    )
    no2_suppression = 1 - (suppression_factor * NO2_SUPPRESSION_STRENGTH)
    
    # Combine factors to get wildfire likelihood
    wildfire_likelihood = hcho_activation * no2_suppression
    
    # Factor in smoke intensity (use default if aerosol not available)
    smoke_intensity = aerosol_norm
    
    # Calculate final WSTI score
    wsti_normalized = wildfire_likelihood * smoke_intensity
    final_score = wsti_normalized * 10
    
    return final_score


def get_threat_level(score: float) -> Dict[str, str]:
    """
    Convert WSTI score to threat level and color
    
    Args:
        score: WSTI score (0-10)
        
    Returns:
        Dictionary with threat level and color code
    """
    if score >= 8:
        return {"level": "Extreme Threat", "color": "#800080"}
    elif score >= 6:
        return {"level": "High Threat", "color": "#FF0000"}
    elif score >= 4:
        return {"level": "Medium Threat", "color": "#FF8C00"}
    elif score >= 2:
        return {"level": "Low Threat", "color": "#FFD700"}
    else:
        return {"level": "Safe", "color": "#32CD32"}


def calculate_wsti_for_points(data_points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calculate WSTI for multiple data points
    
    Args:
        data_points: List of data points with HCHO, aerosol (optional), and NO2 values
        
    Returns:
        List of data points with WSTI scores and threat levels
    """
    threat_points = []
    
    for point in data_points:
        try:
            # Extract values (handle missing data)
            hcho = point.get('hcho', 0.0)
            aerosol = point.get('aerosol', None)  # Default to None for missing aerosol data
            no2 = point.get('no2', 0.0)
            
            # Skip points with invalid HCHO data (required)
            if np.isnan(hcho):
                continue
            
            # Handle missing aerosol data (fallback to default if not available)
            if aerosol is not None and np.isnan(aerosol):
                aerosol = None
            
            # Handle missing NO2 data
            if np.isnan(no2):
                no2 = 0.0
            
            # Calculate WSTI score (aerosol will default to 0.5 if None)
            threat_score = calculate_wsti(hcho, aerosol, no2)
            threat_info = get_threat_level(threat_score)
            
            # Create threat point
            threat_point = {
                'latitude': point.get('latitude', 0.0),
                'longitude': point.get('longitude', 0.0),
                'threat_score': round(threat_score, 2),
                'level': threat_info['level'],
                'color': threat_info['color'],
                'hcho': hcho,
                'aerosol': aerosol if aerosol is not None else 0.5,  # Show default value
                'no2': no2
            }
            
            threat_points.append(threat_point)
            
        except Exception as e:
            # Skip points that cause errors
            continue
    
    return threat_points
