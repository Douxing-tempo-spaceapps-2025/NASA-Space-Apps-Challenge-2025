interface FireDataRecord {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string;
  version: string;
  bright_t31: number;
  frp: number;
  daynight: string;
}

interface FireDataResponse {
  message: string;
  count: number;
  data: FireDataRecord[];
}

interface FireStatistics {
  message: string;
  total_us_fires: number;
  recent_24h_fires: number;
  statistics: {
    total_count: number;
    recent_24h_count: number;
    last_updated: string;
  };
}

interface ApiError {
  error: string;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class FireDataService {
  /**
   * Fetch recent fire data (last 24 hours) from FastAPI
   * @returns Promise<FireDataResponse> - Recent fire data
   */
  static async getRecentFireData(): Promise<FireDataResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/fire-data/recent`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
    });

    const data = await response.json();

    if (!response.ok) {
      const err = data as ApiError;
      throw new Error(`API Error: ${err.error} - ${err.message}`);
    }

    return data as FireDataResponse;
  }

  /**
   * Fetch fire statistics from FastAPI
   * @returns Promise<FireStatistics> - Fire statistics
   */
  static async getFireStatistics(): Promise<FireStatistics> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/fire-data/statistics`,
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

    return data as FireStatistics;
  }

  /**
   * Fetch fire data by location from FastAPI
   * @param lat - Latitude
   * @param lon - Longitude
   * @param distance - Search radius in km (default: 100)
   * @param days - Number of days (default: 7)
   * @param country - Country filter (default: "US")
   * @returns Promise<FireDataRecord[]> - Fire data array
   */
  static async getFireDataByLocation(
    lat?: number,
    lon?: number,
    distance: number = 100,
    days: number = 7,
    country: string = "US"
  ): Promise<FireDataRecord[]> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append("lat", lat.toString());
    if (lon !== undefined) params.append("lon", lon.toString());
    params.append("distance", distance.toString());
    params.append("days", days.toString());
    params.append("country", country);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/fire-data/?${params}`,
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

    return data as FireDataRecord[];
  }

  /**
   * Get fire intensity color based on brightness value
   * @param brightness - Fire brightness value
   * @returns string - Hex color code (different shades of red)
   */
  static getFireIntensityColor(brightness: number): string {
    if (brightness < 310) return "#FFB3B3"; // Low intensity - Light red
    if (brightness < 330) return "#FF9999"; // Medium-low intensity - Light-medium red
    if (brightness < 350) return "#FF6666"; // Medium intensity - Medium red
    if (brightness < 365) return "#FF3333"; // High intensity - Dark red
    return "#CC0000"; // Very high intensity - Very dark red
  }

  /**
   * Get fire intensity description
   * @param brightness - Fire brightness value
   * @returns string - Intensity description
   */
  static getFireIntensityDescription(brightness: number): string {
    if (brightness < 300) return "Low";
    if (brightness < 400) return "Medium";
    if (brightness < 500) return "High";
    return "Very High";
  }

  /**
   * Get day/night description
   * @param daynight - Day/night indicator ("D" or "N")
   * @returns string - Description
   */
  static getDayNightDescription(daynight: string): string {
    return daynight === "D" ? "Day" : "Night";
  }

  /**
   * Format acquisition time for display
   * @param acq_date - Acquisition date (YYYY-MM-DD)
   * @param acq_time - Acquisition time (HHMM)
   * @returns string - Formatted datetime
   */
  static formatAcquisitionTime(acq_date: string, acq_time: string): string {
    const timeStr = acq_time.padStart(4, "0");
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    return `${acq_date} ${hours}:${minutes}`;
  }
}

export type { FireDataRecord, FireDataResponse, FireStatistics };
