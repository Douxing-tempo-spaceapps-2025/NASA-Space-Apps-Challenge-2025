interface TemperatureDataResponse {
  data: Array<{
    longitude: number;
    latitude: number;
    temperature: number;
    timestamp: string;
  }>;
  metadata: Record<string, any>;
}

interface ApiError {
  error: string;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class TemperatureService {
  /**
   * Fetch current temperature data for a location
   * @param longitude - Longitude coordinate
   * @param latitude - Latitude coordinate
   * @returns Promise<TemperatureDataResponse> - Temperature data
   */
  static async getCurrentTemperatureByLocation(
    longitude: number,
    latitude: number
  ): Promise<{
    longitude: number;
    latitude: number;
    temperature: number;
    timestamp: string;
  }> {
    const params = new URLSearchParams({
      longitude: longitude.toString(),
      latitude: latitude.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/v1/temperature/by-location?${params}`,
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

    const apiResponse = data as TemperatureDataResponse;
    
    // Extract the first temperature data point
    if (apiResponse.data && apiResponse.data.length > 0) {
      return apiResponse.data[0];
    }
    
    throw new Error("No temperature data available");
  }

  /**
   * Get temperature color based on temperature value
   * @param temperature - Temperature value in Celsius
   * @returns string - Hex color code (red for hot, blue for cold)
   */
  static getTemperatureColor(temperature: number): string {
    // Handle undefined, null, or NaN values
    if (
      temperature === undefined ||
      temperature === null ||
      isNaN(temperature)
    ) {
      return "#E3F2FD"; // Default to very light blue
    }

    // Color scale from blue (cold) to red (hot)
    if (temperature < -20) return "#0D47A1"; // Dark blue - Very cold
    if (temperature < -10) return "#1565C0"; // Blue - Cold
    if (temperature < 0) return "#1E88E5"; // Light blue - Freezing
    if (temperature < 10) return "#42A5F5"; // Light blue - Cool
    if (temperature < 20) return "#90CAF9"; // Very light blue - Mild
    if (temperature < 30) return "#FFB74D"; // Orange - Warm
    if (temperature < 40) return "#FF8A65"; // Light red - Hot
    if (temperature < 50) return "#E57373"; // Red - Very hot
    return "#F44336"; // Dark red - Extreme heat
  }

  /**
   * Get temperature description
   * @param temperature - Temperature value in Celsius
   * @returns string - Temperature description
   */
  static getTemperatureDescription(temperature: number): string {
    // Handle undefined, null, or NaN values
    if (
      temperature === undefined ||
      temperature === null ||
      isNaN(temperature)
    ) {
      return "No Data";
    }

    if (temperature < -20) return "Extremely Cold";
    if (temperature < -10) return "Very Cold";
    if (temperature < 0) return "Freezing";
    if (temperature < 10) return "Cold";
    if (temperature < 20) return "Cool";
    if (temperature < 30) return "Warm";
    if (temperature < 40) return "Hot";
    if (temperature < 50) return "Very Hot";
    return "Extremely Hot";
  }

  /**
   * Format temperature value for display
   * @param temperature - Temperature value in Celsius
   * @returns string - Formatted value
   */
  static formatTemperature(temperature: number): string {
    // Handle undefined, null, or NaN values
    if (
      temperature === undefined ||
      temperature === null ||
      isNaN(temperature)
    ) {
      return "N/A";
    }

    return `${temperature.toFixed(1)}°C`;
  }

  /**
   * Convert Celsius to Fahrenheit
   * @param celsius - Temperature in Celsius
   * @returns number - Temperature in Fahrenheit
   */
  static celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  /**
   * Format temperature in Fahrenheit
   * @param temperature - Temperature value in Celsius
   * @returns string - Formatted value in Fahrenheit
   */
  static formatTemperatureFahrenheit(temperature: number): string {
    // Handle undefined, null, or NaN values
    if (
      temperature === undefined ||
      temperature === null ||
      isNaN(temperature)
    ) {
      return "N/A";
    }

    const fahrenheit = this.celsiusToFahrenheit(temperature);
    return `${fahrenheit.toFixed(1)}°F`;
  }
}

export type { TemperatureDataResponse };
