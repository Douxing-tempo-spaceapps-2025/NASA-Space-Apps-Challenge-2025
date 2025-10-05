const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface WSTIPoint {
  latitude: number;
  longitude: number;
  threat_score: number;
  level: string;
  color: string;
  hcho: number;
  aerosol: number;
  no2: number;
}

export interface WSTIResponse {
  heatmap_data: WSTIPoint[];
  total_points: number;
  data_age_hours: number;
  search_range_hours: number;
}

export class WSTIService {
  static async getWSTIHeatmap(
    hoursBack: number = 6,
    sampleStep: number = 20
  ): Promise<WSTIResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/tempo-data/wsti-heatmap?hours_back=${hoursBack}&sample_step=${sampleStep}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch WSTI heatmap data:", error);
      throw error;
    }
  }

  static async getWSTIStatus(): Promise<{
    status: string;
    last_update: string;
    data_available: boolean;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tempo-data/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch WSTI status:", error);
      throw error;
    }
  }
}
