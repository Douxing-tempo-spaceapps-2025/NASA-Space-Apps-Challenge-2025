interface AirNowRecord {
  date: string;
  time: string;
  state: string;
  city: string;
  pollutant: string;
  aqi: number;
  category: string;
  latitude: number;
  longitude: number;
}

interface ProcessedStation {
  city: string;
  state: string;
  coordinates: [number, number];
  pollutants: {
    [key: string]: {
      value: number;
      category: string;
    };
  };
}

interface ApiResponse {
  timestamp: string;
  totalStations: number;
  stations: ProcessedStation[];
}

interface ApiError {
  error: string;
  message: string;
}

interface FastAPIResponse {
  message: string;
  count: number;
  data: AirNowRecord[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class AirQualityService {
  /**
   * Fetch all air quality stations data from the FastAPI backend
   * @returns Promise<ApiResponse> - Array of processed station data
   */
  static async getAllStations(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/air-quality/current`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
    });

    const data = await response.json();

    if (!response.ok) {
      const err = data as ApiError;
      throw new Error(`API Error: ${err.error} - ${err.message}`);
    }

    // Transform FastAPI response to match expected format
    const transformedData = this.transformFastAPIResponse(data);
    return transformedData;
  }

  /**
   * Manually trigger data update on the backend
   * Note: FastAPI doesn't have an update endpoint, so we just refetch data
   * @returns Promise<string> - Success message
   */
  static async updateData(): Promise<string> {
    // FastAPI automatically fetches fresh data, so we just return a success message
    return "Data refreshed successfully";
  }

  /**
   * Transform FastAPI response to match expected frontend format
   * @param fastApiData - Raw data from FastAPI
   * @returns ApiResponse - Transformed data for frontend
   */
  private static transformFastAPIResponse(
    fastApiData: FastAPIResponse
  ): ApiResponse {
    const rawData = fastApiData.data;

    // Group data by city and state
    const stationMap = new Map<string, ProcessedStation>();

    rawData.forEach((record) => {
      const key = `${record.city},${record.state}`;

      if (!stationMap.has(key)) {
        stationMap.set(key, {
          city: record.city,
          state: record.state,
          coordinates: [record.longitude, record.latitude],
          pollutants: {},
        });
      }

      const station = stationMap.get(key)!;
      station.pollutants[record.pollutant] = {
        value: record.aqi,
        category: record.category,
      };
    });

    return {
      timestamp: new Date().toISOString(),
      totalStations: stationMap.size,
      stations: Array.from(stationMap.values()),
    };
  }

  /**
   * Get AQI category color based on AQI value
   * @param aqi - AQI value
   * @returns string - Hex color code
   */
  static getAQIColor(aqi: number): string {
    if (aqi <= 50) return "#00E400"; // Good - Green
    if (aqi <= 100) return "#FFD700"; // Moderate - Darker Yellow (more visible)
    if (aqi <= 150) return "#FF7E00"; // Unhealthy for Sensitive Groups - Orange
    if (aqi <= 200) return "#FF0000"; // Unhealthy - Red
    if (aqi <= 300) return "#8F3F97"; // Very Unhealthy - Purple
    return "#7E0023"; // Hazardous - Maroon
  }

  /**
   * Get AQI category description
   * @param aqi - AQI value
   * @returns string - Category description
   */
  static getAQICategory(aqi: number): string {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  }
}

export type { ProcessedStation, ApiResponse, AirNowRecord };
