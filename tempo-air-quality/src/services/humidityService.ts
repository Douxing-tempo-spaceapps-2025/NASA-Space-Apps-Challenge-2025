interface HumidityDataResponse {
  data: Array<{
    longitude: number;
    latitude: number;
    relative_humidity: number;
    dew_point_celsius: number;
    temperature_celsius: number;
    timestamp: string;
  }>;
  metadata: Record<string, any>;
}

interface ApiError {
  error: string;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class HumidityService {
  /**
   * Fetch current humidity data for a location
   * @param longitude - Longitude coordinate
   * @param latitude - Latitude coordinate
   * @returns Promise<HumidityDataResponse> - Humidity data
   */
  static async getCurrentHumidityByLocation(
    longitude: number,
    latitude: number
  ): Promise<{
    longitude: number;
    latitude: number;
    relative_humidity: number;
    dew_point_celsius: number;
    temperature_celsius: number;
    timestamp: string;
  }> {
    const params = new URLSearchParams({
      longitude: longitude.toString(),
      latitude: latitude.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/v1/humidity/by-location?${params}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-cache",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const err = data as ApiError;
      throw new Error(`API Error: ${err.error} - ${err.message}`);
    }

    const apiResponse = data as HumidityDataResponse;
    
    // Extract the first humidity data point
    if (apiResponse.data && apiResponse.data.length > 0) {
      return apiResponse.data[0];
    }
    
    throw new Error("No humidity data available");
  }

  /**
   * Get humidity color based on relative humidity percentage
   * @param humidity - Relative humidity percentage
   * @returns string - Hex color code (blue scale for humidity)
   */
  static getHumidityColor(humidity: number): string {
    // Handle undefined, null, or NaN values
    if (
      humidity === undefined ||
      humidity === null ||
      isNaN(humidity)
    ) {
      return "#E3F2FD"; // Default to very light blue
    }

    // Color scale from light blue (dry) to dark blue (humid)
    if (humidity < 20) return "#E3F2FD"; // Very light blue - Very dry
    if (humidity < 30) return "#90CAF9"; // Light blue - Dry
    if (humidity < 40) return "#42A5F5"; // Medium light blue - Low humidity
    if (humidity < 50) return "#1E88E5"; // Medium blue - Moderate humidity
    if (humidity < 60) return "#1565C0"; // Dark blue - Comfortable
    if (humidity < 70) return "#0D47A1"; // Darker blue - Humid
    if (humidity < 80) return "#0277BD"; // Very dark blue - Very humid
    return "#01579B"; // Darkest blue - Extremely humid
  }

  /**
   * Get humidity description
   * @param humidity - Relative humidity percentage
   * @returns string - Humidity description
   */
  static getHumidityDescription(humidity: number): string {
    // Handle undefined, null, or NaN values
    if (
      humidity === undefined ||
      humidity === null ||
      isNaN(humidity)
    ) {
      return "No Data";
    }

    if (humidity < 20) return "Very Dry";
    if (humidity < 30) return "Dry";
    if (humidity < 40) return "Low Humidity";
    if (humidity < 50) return "Moderate";
    if (humidity < 60) return "Comfortable";
    if (humidity < 70) return "Humid";
    if (humidity < 80) return "Very Humid";
    return "Extremely Humid";
  }

  /**
   * Format humidity value for display
   * @param humidity - Relative humidity percentage
   * @returns string - Formatted value
   */
  static formatHumidity(humidity: number): string {
    // Handle undefined, null, or NaN values
    if (
      humidity === undefined ||
      humidity === null ||
      isNaN(humidity)
    ) {
      return "N/A";
    }

    return `${humidity.toFixed(1)}%`;
  }

  /**
   * Format dew point temperature
   * @param dewPoint - Dew point temperature in Celsius
   * @returns string - Formatted dew point value
   */
  static formatDewPoint(dewPoint: number): string {
    // Handle undefined, null, or NaN values
    if (
      dewPoint === undefined ||
      dewPoint === null ||
      isNaN(dewPoint)
    ) {
      return "N/A";
    }

    return `${dewPoint.toFixed(1)}°C`;
  }

  /**
   * Get comfort level based on temperature and humidity
   * @param temperature - Temperature in Celsius
   * @param humidity - Relative humidity percentage
   * @returns string - Comfort level description
   */
  static getComfortLevel(temperature: number, humidity: number): string {
    if (
      temperature === undefined ||
      temperature === null ||
      isNaN(temperature) ||
      humidity === undefined ||
      humidity === null ||
      isNaN(humidity)
    ) {
      return "Unknown";
    }

    // Comfort zone calculation based on temperature and humidity
    if (temperature < 0) return "Cold";
    if (temperature > 35) return "Hot";
    
    if (humidity < 30) {
      if (temperature < 20) return "Cold & Dry";
      if (temperature < 30) return "Dry";
      return "Hot & Dry";
    }
    
    if (humidity > 70) {
      if (temperature < 20) return "Cold & Humid";
      if (temperature < 30) return "Humid";
      return "Hot & Humid";
    }
    
    if (temperature >= 20 && temperature <= 26 && humidity >= 40 && humidity <= 60) {
      return "Comfortable";
    }
    
    return "Moderate";
  }
}

export type { HumidityDataResponse };
