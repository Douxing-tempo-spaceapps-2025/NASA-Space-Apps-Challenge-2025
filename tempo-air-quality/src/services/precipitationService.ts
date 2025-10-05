interface PrecipitationDataResponse {
  longitude: number;
  latitude: number;
  start_date?: string;
  end_date?: string;
  total_precipitation_mm: number;
  timestamp?: string;
}

interface ApiError {
  error: string;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class PrecipitationService {
  /**
   * Fetch current precipitation data (past 7 days cumulative) for a location
   * @param longitude - Longitude coordinate
   * @param latitude - Latitude coordinate
   * @returns Promise<PrecipitationDataResponse> - Precipitation data
   */
  static async getCurrentPrecipitationByLocation(
    longitude: number,
    latitude: number
  ): Promise<PrecipitationDataResponse> {
    const params = new URLSearchParams({
      longitude: longitude.toString(),
      latitude: latitude.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/v1/precipitation/by-location/current?${params}`,
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

    return data as PrecipitationDataResponse;
  }

  /**
   * Fetch precipitation data for a location within a date range
   * @param longitude - Longitude coordinate
   * @param latitude - Latitude coordinate
   * @param startDate - Start date (YYYY-MM-DD), optional
   * @param endDate - End date (YYYY-MM-DD), optional
   * @returns Promise<PrecipitationDataResponse> - Precipitation data
   */
  static async getPrecipitationByLocation(
    longitude: number,
    latitude: number,
    startDate?: string,
    endDate?: string
  ): Promise<PrecipitationDataResponse> {
    const params = new URLSearchParams({
      longitude: longitude.toString(),
      latitude: latitude.toString(),
    });

    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/precipitation/by-location?${params}`,
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

    return data as PrecipitationDataResponse;
  }

  /**
   * Get precipitation intensity color based on mm value
   * @param precipitationMm - Precipitation value in mm
   * @returns string - Hex color code (shades of blue)
   */
  static getPrecipitationColor(precipitationMm: number): string {
    // Handle undefined, null, or NaN values
    if (
      precipitationMm === undefined ||
      precipitationMm === null ||
      isNaN(precipitationMm)
    ) {
      return "#E3F2FD"; // Default to very light blue
    }

    if (precipitationMm < 1) return "#E3F2FD"; // Very light blue - Trace
    if (precipitationMm < 10) return "#90CAF9"; // Light blue - Light rain
    if (precipitationMm < 25) return "#42A5F5"; // Medium blue - Moderate rain
    if (precipitationMm < 50) return "#1E88E5"; // Dark blue - Heavy rain
    if (precipitationMm < 100) return "#1565C0"; // Very dark blue - Very heavy rain
    return "#0D47A1"; // Darkest blue - Extreme rain
  }

  /**
   * Get precipitation intensity description
   * @param precipitationMm - Precipitation value in mm
   * @returns string - Intensity description
   */
  static getPrecipitationDescription(precipitationMm: number): string {
    // Handle undefined, null, or NaN values
    if (
      precipitationMm === undefined ||
      precipitationMm === null ||
      isNaN(precipitationMm)
    ) {
      return "No Data";
    }

    if (precipitationMm < 0.1) return "No Rain";
    if (precipitationMm < 1) return "Trace";
    if (precipitationMm < 10) return "Light Rain";
    if (precipitationMm < 25) return "Moderate Rain";
    if (precipitationMm < 50) return "Heavy Rain";
    if (precipitationMm < 100) return "Very Heavy Rain";
    return "Extreme Rain";
  }

  /**
   * Format precipitation value for display
   * @param precipitationMm - Precipitation value in mm
   * @returns string - Formatted value
   */
  static formatPrecipitation(precipitationMm: number): string {
    // Handle undefined, null, or NaN values
    if (
      precipitationMm === undefined ||
      precipitationMm === null ||
      isNaN(precipitationMm)
    ) {
      return "0 mm";
    }

    if (precipitationMm < 0.1) return "0 mm";
    if (precipitationMm < 1) return `${precipitationMm.toFixed(2)} mm`;
    if (precipitationMm < 10) return `${precipitationMm.toFixed(1)} mm`;
    return `${precipitationMm.toFixed(0)} mm`;
  }
}

export type { PrecipitationDataResponse };

