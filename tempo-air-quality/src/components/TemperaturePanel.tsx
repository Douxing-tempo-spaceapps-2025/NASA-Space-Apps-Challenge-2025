"use client";

import { useState, useEffect } from "react";
import { TemperatureService } from "../services/temperatureService";

interface TemperaturePanelProps {
    selectedLocation: {
        longitude: number;
        latitude: number;
        name?: string;
    } | null;
}

interface TemperatureData {
    temperature: number;
    longitude: number;
    latitude: number;
    timestamp?: string;
}

export default function TemperaturePanel({
    selectedLocation,
}: TemperaturePanelProps) {
    const [tempData, setTempData] = useState<TemperatureData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedLocation) {
            fetchTemperatureData(
                selectedLocation.longitude,
                selectedLocation.latitude
            );
        }
    }, [selectedLocation]);

    const fetchTemperatureData = async (
        longitude: number,
        latitude: number
    ) => {
        setLoading(true);
        setError(null);

        try {
            const data =
                await TemperatureService.getCurrentTemperatureByLocation(
                    longitude,
                    latitude
                );
            setTempData(data);
        } catch (err) {
            console.error("Failed to fetch temperature data:", err);
            setError("Failed to load temperature data");
            setTempData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (selectedLocation) {
            fetchTemperatureData(
                selectedLocation.longitude,
                selectedLocation.latitude
            );
        }
    };

    if (!selectedLocation) {
        return (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-3 gap-2">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center flex-1 min-w-0">
                        <svg
                            className="w-5 h-5 mr-2 text-orange-600 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="truncate">Temperature Data</span>
                    </h3>
                </div>

                <div className="text-center py-8">
                    <svg
                        className="w-16 h-16 mx-auto text-gray-300 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <p className="text-gray-500 text-sm">
                        Click on the map to view temperature data
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3 gap-2">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center flex-1 min-w-0">
                    <svg
                        className="w-5 h-5 mr-2 text-orange-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="truncate">Temperature Data</span>
                </h3>
                <button
                    onClick={handleRefresh}
                    className="p-1.5 hover:bg-orange-100 rounded-lg transition-colors flex-shrink-0"
                    title="Refresh data"
                    disabled={loading}
                >
                    <svg
                        className={`w-4 h-4 text-orange-600 ${loading ? "animate-spin" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </button>
            </div>

            {/* Location Info */}
            <div className="bg-white rounded-lg p-3 mb-3">
                <div className="text-xs text-gray-500 mb-1 font-medium">📍 Location</div>
                {selectedLocation.name && (
                    <div className="font-medium text-gray-900 mb-2 text-sm break-words">
                        {selectedLocation.name}
                    </div>
                )}
                <div className="text-xs text-gray-600 space-y-0.5">
                    <div className="break-all">Lat: {selectedLocation.latitude.toFixed(4)}°</div>
                    <div className="break-all">Lon: {selectedLocation.longitude.toFixed(4)}°</div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-lg p-6 text-center overflow-hidden">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600 break-words">Loading temperature data...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200 overflow-hidden">
                    <div className="flex items-start gap-2">
                        <svg
                            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-red-800">Error</p>
                            <p className="text-xs text-red-700 mt-1 break-words">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Display */}
            {tempData && !loading && !error && (
                <div className="space-y-3">
                    {/* Main Temperature Value */}
                    <div className="bg-white rounded-lg p-4 overflow-hidden">
                        <div className="text-center">
                            <div className="text-xs text-gray-500 mb-2 font-medium">
                                Current Temperature
                            </div>
                            <div
                                className="text-4xl font-bold mb-2 break-words"
                                style={{
                                    color: TemperatureService.getTemperatureColor(
                                        tempData.temperature ?? 0
                                    ),
                                }}
                            >
                                {TemperatureService.formatTemperature(
                                    tempData.temperature ?? 0
                                )}
                            </div>
                            <div
                                className="text-sm font-semibold break-words"
                                style={{
                                    color: TemperatureService.getTemperatureColor(
                                        tempData.temperature ?? 0
                                    ),
                                }}
                            >
                                {TemperatureService.getTemperatureDescription(
                                    tempData.temperature ?? 0
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Temperature Scale */}
                    <div className="bg-white rounded-lg p-4 overflow-hidden">
                        <div className="text-xs text-gray-500 mb-2 font-medium">🌡️ Temperature Scale</div>
                        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.min(
                                        Math.max(((tempData.temperature ?? 0) + 20) / 70 * 100, 0),
                                        100
                                    )}%`,
                                    backgroundColor:
                                        TemperatureService.getTemperatureColor(
                                            tempData.temperature ?? 0
                                        ),
                                }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700 px-2">
                                <span className="truncate">{TemperatureService.formatTemperature(tempData.temperature ?? 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-2 font-medium">ℹ️ Data Information</div>
                        <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between gap-2">
                                <span className="flex-shrink-0">Data Source:</span>
                                <span className="font-medium text-right">ECMWF</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="flex-shrink-0">Time Range:</span>
                                <span className="font-medium text-right">Current</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="flex-shrink-0">Resolution:</span>
                                <span className="font-medium text-right">~27.8 km</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="flex-shrink-0">Coverage:</span>
                                <span className="font-medium text-right">Global</span>
                            </div>
                        </div>
                    </div>

                    {/* Temperature Legend */}
                    <div className="bg-white rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-2 font-medium">🌈 Temperature Scale</div>
                        <div className="space-y-1.5">
                            {[
                                { range: "< -10°C", label: "Very Cold", color: "#0D47A1" },
                                { range: "-10 to 0°C", label: "Cold", color: "#1565C0" },
                                { range: "0 to 10°C", label: "Cool", color: "#42A5F5" },
                                { range: "10 to 20°C", label: "Mild", color: "#90CAF9" },
                                { range: "20 to 30°C", label: "Warm", color: "#FFB74D" },
                                { range: "30°C+", label: "Hot", color: "#F44336" },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-xs text-gray-700 truncate">{item.label}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 flex-shrink-0">{item.range}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
