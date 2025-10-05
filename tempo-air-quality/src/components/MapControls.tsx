"use client";

import { useState } from "react";

interface MapControlsProps {
  showFireData: boolean;
  showAirQuality: boolean;
  showPrecipitation: boolean;
  showTemperature: boolean;
  showHumidity: boolean;
  showFireRisk: boolean;
  onToggleFireData: (show: boolean) => void;
  onToggleAirQuality: (show: boolean) => void;
  onTogglePrecipitation: (show: boolean) => void;
  onToggleTemperature: (show: boolean) => void;
  onToggleHumidity: (show: boolean) => void;
  onToggleFireRisk: (show: boolean) => void;
}

export default function MapControls({
  showFireData,
  showAirQuality,
  showPrecipitation,
  showTemperature,
  showHumidity,
  showFireRisk,
  onToggleFireData,
  onToggleAirQuality,
  onTogglePrecipitation,
  onToggleTemperature,
  onToggleHumidity,
  onToggleFireRisk,
}: MapControlsProps) {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Control Panel */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Map Layers</h3>

        {/* Fire Data Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700">Fire Data</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showFireData}
              onChange={(e) => onToggleFireData(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Air Quality Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700">Air Quality Stations</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showAirQuality}
              onChange={(e) => onToggleAirQuality(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Precipitation Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-sm text-gray-700">Precipitation</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showPrecipitation}
              onChange={(e) => onTogglePrecipitation(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Temperature Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-700">Temperature</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showTemperature}
              onChange={(e) => onToggleTemperature(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Humidity Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700">Humidity</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showHumidity}
              onChange={(e) => onToggleHumidity(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Fire Risk Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-sm text-gray-700">Fire Risk</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showFireRisk}
              onChange={(e) => onToggleFireRisk(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Legend Toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border-t border-gray-200"
        >
          {showLegend ? "Hide Legend" : "Show Legend"}
        </button>
      </div>

      {/* Legend Panel */}
      {showLegend && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Legend</h4>

          {/* Fire Data Legend */}
          {showFireData && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                Fire Intensity
              </h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#FFB3B3" }}
                  ></div>
                  <span className="text-xs text-gray-600">Low (&lt;310K)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#FF9999" }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    Medium-Low (310-330K)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#FF6666" }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    Medium (330-350K)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#FF3333" }}
                  ></div>
                  <span className="text-xs text-gray-600">High (350-365K)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#CC0000" }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    Very High (365K+)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Air Quality Legend */}
          {showAirQuality && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                Air Quality Index (AQI)
              </h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Good (0-50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600">
                    Moderate (51-100)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs text-gray-600">
                    Unhealthy (101-150)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">
                    Unhealthy (151-200)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-gray-600">
                    Hazardous (201+)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Precipitation Legend */}
          {showPrecipitation && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                Precipitation (7 Days)
              </h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#E3F2FD" }}
                  ></div>
                  <span className="text-xs text-gray-600">Trace (&lt;1mm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#90CAF9" }}
                  ></div>
                  <span className="text-xs text-gray-600">Light (1-10mm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#42A5F5" }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    Moderate (10-25mm)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#1E88E5" }}
                  ></div>
                  <span className="text-xs text-gray-600">Heavy (25-50mm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#1565C0" }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    Very Heavy (50-100mm)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#0D47A1" }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    Extreme (100mm+)
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 italic">
                💡 Click anywhere on the map
              </div>
            </div>
          )}

          {/* Temperature Legend */}
          {showTemperature && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                Temperature
              </h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#0D47A1" }}
                  ></div>
                  <span className="text-xs text-gray-600">Very Cold (&lt;-10°C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#1565C0" }}
                  ></div>
                  <span className="text-xs text-gray-600">Cold (-10 to 0°C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#42A5F5" }}
                  ></div>
                  <span className="text-xs text-gray-600">Cool (0 to 10°C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#90CAF9" }}
                  ></div>
                  <span className="text-xs text-gray-600">Mild (10 to 20°C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#FFB74D" }}
                  ></div>
                  <span className="text-xs text-gray-600">Warm (20 to 30°C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#F44336" }}
                  ></div>
                  <span className="text-xs text-gray-600">Hot (30°C+)</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 italic">
                💡 Click anywhere on the map
              </div>
            </div>
          )}

          {/* Humidity Legend */}
          {showHumidity && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                Humidity
              </h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#E3F2FD" }}
                  ></div>
                  <span className="text-xs text-gray-600">Very Dry (&lt;30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#90CAF9" }}
                  ></div>
                  <span className="text-xs text-gray-600">Dry (30-40%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#42A5F5" }}
                  ></div>
                  <span className="text-xs text-gray-600">Low (40-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#1E88E5" }}
                  ></div>
                  <span className="text-xs text-gray-600">Moderate (50-60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#1565C0" }}
                  ></div>
                  <span className="text-xs text-gray-600">Comfortable (60-70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#0D47A1" }}
                  ></div>
                  <span className="text-xs text-gray-600">Humid (70%+)</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 italic">
                💡 Click anywhere on the map
              </div>
            </div>
          )}

          {/* Fire Risk Legend */}
          {showFireRisk && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                Fire Risk Index
              </h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#4CAF50" }}
                  ></div>
                  <span className="text-xs text-gray-600">Very Low (&lt;-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#8BC34A" }}
                  ></div>
                  <span className="text-xs text-gray-600">Low (-10 to -5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#FFEB3B" }}
                  ></div>
                  <span className="text-xs text-gray-600">Moderate (-5 to 0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#FF9800" }}
                  ></div>
                  <span className="text-xs text-gray-600">High (0 to 5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#FF5722" }}
                  ></div>
                  <span className="text-xs text-gray-600">Very High (5 to 10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#D32F2F" }}
                  ></div>
                  <span className="text-xs text-gray-600">Extreme (10+)</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 italic">
                💡 Click anywhere on the map
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
