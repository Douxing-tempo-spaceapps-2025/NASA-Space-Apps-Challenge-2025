interface FireRiskDataResponse {
    longitude: number;
    latitude: number;
    wildfire_risk_index: number;
    component_data: {
      temperature: number;
      humidity: number;
      wind_speed: number;
      precipitation: number;
    };
    metadata: {
      source: string;
      description: string;
      unit: string;
      formula: string;
      resolution: string;
      coverage: string;
    };
  }
  
  interface ApiError {
    error: string;
    message: string;
  }
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  export class FireRiskService {
    /**
     * Fetch wildfire risk data for a location
     * @param longitude - Longitude coordinate
     * @param latitude - Latitude coordinate
     * @returns Promise<FireRiskDataResponse> - Fire risk data
     */
    static async getFireRiskByLocation(
      longitude: number,
      latitude: number
    ): Promise<FireRiskDataResponse> {
      const params = new URLSearchParams({
        longitude: longitude.toString(),
        latitude: latitude.toString(),
      });
  
      const response = await fetch(
        `${API_BASE_URL}/api/v1/fire-risk/by-location?${params}`,
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
  
      return data as FireRiskDataResponse;
    }
  
    /**
     * Get fire risk color based on risk index value
     * @param riskIndex - Fire risk index value
     * @returns string - Hex color code
     */
    static getFireRiskColor(riskIndex: number): string {
      // Handle undefined, null, or NaN values
      if (
        riskIndex === undefined ||
        riskIndex === null ||
        isNaN(riskIndex)
      ) {
        return "#E3F2FD"; // Default to very light blue
      }
  
      // Color scale from green (low risk) to red (high risk)
      if (riskIndex < -10) return "#4CAF50"; // Green - Very Low Risk
      if (riskIndex < -5) return "#8BC34A"; // Light Green - Low Risk
      if (riskIndex < 0) return "#FFEB3B"; // Yellow - Moderate Risk
      if (riskIndex < 5) return "#FF9800"; // Orange - High Risk
      if (riskIndex < 10) return "#FF5722"; // Red - Very High Risk
      return "#D32F2F"; // Dark Red - Extreme Risk
    }
  
    /**
     * Get fire risk level description
     * @param riskIndex - Fire risk index value
     * @returns string - Risk level description
     */
    static getFireRiskLevel(riskIndex: number): string {
      // Handle undefined, null, or NaN values
      if (
        riskIndex === undefined ||
        riskIndex === null ||
        isNaN(riskIndex)
      ) {
        return "No Data";
      }
  
      if (riskIndex < -10) return "Very Low";
      if (riskIndex < -5) return "Low";
      if (riskIndex < 0) return "Moderate";
      if (riskIndex < 5) return "High";
      if (riskIndex < 10) return "Very High";
      return "Extreme";
    }
  
    /**
     * Get fire risk level description in Chinese
     * @param riskIndex - Fire risk index value
     * @returns string - Risk level description in Chinese
     */
    static getFireRiskLevelChinese(riskIndex: number): string {
      // Handle undefined, null, or NaN values
      if (
        riskIndex === undefined ||
        riskIndex === null ||
        isNaN(riskIndex)
      ) {
        return "无数据";
      }
  
      if (riskIndex < -10) return "极低";
      if (riskIndex < -5) return "低";
      if (riskIndex < 0) return "中等";
      if (riskIndex < 5) return "高";
      if (riskIndex < 10) return "很高";
      return "极高";
    }
  
    /**
     * Format fire risk index for display
     * @param riskIndex - Fire risk index value
     * @returns string - Formatted value
     */
    static formatFireRiskIndex(riskIndex: number): string {
      // Handle undefined, null, or NaN values
      if (
        riskIndex === undefined ||
        riskIndex === null ||
        isNaN(riskIndex)
      ) {
        return "N/A";
      }
  
      return riskIndex.toFixed(2);
    }
  
    /**
     * Get fire risk recommendations based on risk level
     * @param riskIndex - Fire risk index value
     * @returns string[] - Array of recommendations
     */
    static getFireRiskRecommendations(riskIndex: number): string[] {
      if (
        riskIndex === undefined ||
        riskIndex === null ||
        isNaN(riskIndex)
      ) {
        return ["无法获取火险数据"];
      }
  
      if (riskIndex < -10) {
        return [
          "火险等级：极低",
          "建议：正常活动，注意基本防火"
        ];
      }
      
      if (riskIndex < -5) {
        return [
          "火险等级：低",
          "建议：注意用火安全，避免在干燥区域生火"
        ];
      }
      
      if (riskIndex < 0) {
        return [
          "火险等级：中等",
          "建议：谨慎用火，避免户外烧烤等明火活动"
        ];
      }
      
      if (riskIndex < 5) {
        return [
          "火险等级：高",
          "建议：避免户外用火，注意防火安全"
        ];
      }
      
      if (riskIndex < 10) {
        return [
          "火险等级：很高",
          "建议：禁止户外用火，提高防火意识"
        ];
      }
      
      return [
        "火险等级：极高",
        "建议：严禁一切户外用火，加强防火措施"
      ];
    }
  
    /**
     * Format component data for display
     * @param componentData - Component data object
     * @returns object - Formatted component data
     */
    static formatComponentData(componentData: {
      temperature: number;
      humidity: number;
      wind_speed: number;
      precipitation: number;
    }) {
      return {
        temperature: `${componentData.temperature.toFixed(1)}°C`,
        humidity: `${componentData.humidity.toFixed(1)}%`,
        wind_speed: `${componentData.wind_speed.toFixed(1)} m/s`,
        precipitation: `${componentData.precipitation.toFixed(1)} mm`
      };
    }
  }
  
  export type { FireRiskDataResponse };
  