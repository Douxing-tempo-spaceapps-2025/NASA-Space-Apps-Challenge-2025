"use client";

import { useState, useEffect } from "react";
import {
  FireRiskService,
  FireRiskDataResponse,
} from "../services/fireRiskService";

interface FireRiskPanelProps {
  selectedLocation: {
    longitude: number;
    latitude: number;
    name?: string;
  } | null;
}

export default function FireRiskPanel({
  selectedLocation,
}: FireRiskPanelProps) {
  const [fireRiskData, setFireRiskData] = useState<FireRiskDataResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedLocation) {
      setFireRiskData(null);
      setError(null);
      return;
    }

    const fetchFireRiskData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await FireRiskService.getFireRiskByLocation(
          selectedLocation.longitude,
          selectedLocation.latitude
        );
        setFireRiskData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch fire risk data"
        );
        setFireRiskData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFireRiskData();
  }, [selectedLocation]);

  if (!selectedLocation) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Wildfire Risk</h3>
        </div>
        <p className="text-gray-500 text-sm">
          Select a location on the map to view fire risk data
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Wildfire Risk</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">Loading fire risk data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Wildfire Risk</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!fireRiskData) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Wildfire Risk</h3>
        </div>
        <p className="text-gray-500 text-sm">No fire risk data available</p>
      </div>
    );
  }

  const riskLevel = FireRiskService.getFireRiskLevel(
    fireRiskData.wildfire_risk_index
  );
  const riskColor = FireRiskService.getFireRiskColor(
    fireRiskData.wildfire_risk_index
  );
  const recommendations = FireRiskService.getFireRiskRecommendations(
    fireRiskData.wildfire_risk_index
  );
  const formattedComponents = FireRiskService.formatComponentData(
    fireRiskData.component_data
  );

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Wildfire Risk</h3>
      </div>

      {/* Risk Index Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Risk Index:</span>
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: riskColor }}
          >
            {FireRiskService.formatFireRiskIndex(
              fireRiskData.wildfire_risk_index
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Risk Level:</span>
          <span className="text-sm font-semibold text-gray-900">
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Component Data */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Weather Components
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-600">Temperature:</span>
            <span className="ml-1 font-medium">
              {formattedComponents.temperature}
            </span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-600">Humidity:</span>
            <span className="ml-1 font-medium">
              {formattedComponents.humidity}
            </span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-600">Wind Speed:</span>
            <span className="ml-1 font-medium">
              {formattedComponents.wind_speed}
            </span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-600">Precipitation:</span>
            <span className="ml-1 font-medium">
              {formattedComponents.precipitation}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Recommendations
        </h4>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          {recommendations.map((rec, index) => (
            <p key={index} className="text-sm text-yellow-800 mb-1">
              {rec}
            </p>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-500">
        <p>Source: {fireRiskData.metadata.source}</p>
        <p>Resolution: {fireRiskData.metadata.resolution}</p>
        <p>Coverage: {fireRiskData.metadata.coverage}</p>
      </div>
    </div>
  );
}
