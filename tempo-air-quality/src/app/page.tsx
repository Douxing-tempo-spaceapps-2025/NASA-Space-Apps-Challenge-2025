"use client";

import { useState } from "react";
import MapBase from "@/components/MapBase";
import LocationPanel from "@/components/LocationPanel";
import PrecipitationPanel from "@/components/PrecipitationPanel";
import TemperaturePanel from "@/components/TemperaturePanel";
import HumidityPanel from "@/components/HumidityPanel";
import type { Map } from "maplibre-gl";

export default function Home() {
  const [mapRef, setMapRef] = useState<Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    longitude: number;
    latitude: number;
    name?: string;
  } | null>(null);

  const handleLocationSelect = (location: {
    longitude: number;
    latitude: number;
    name?: string;
  }) => {
    setSelectedLocation(location);
  };

  return (
    <main className="flex h-screen pt-16">
      <div className="flex-1 relative">
        <MapBase
          onMapReady={setMapRef}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      <aside className="w-80 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Weather Data Panel
        </h2>

        {/* Location Panel */}
        <LocationPanel
          mapRef={mapRef}
          onLocationSelect={handleLocationSelect}
        />

        {/* Precipitation Panel */}
        <div className="mb-4">
          <PrecipitationPanel selectedLocation={selectedLocation} />
        </div>

        {/* Temperature Panel */}
        <div className="mb-4">
          <TemperaturePanel selectedLocation={selectedLocation} />
        </div>

        {/* Humidity Panel */}
        <div className="mb-4">
          <HumidityPanel selectedLocation={selectedLocation} />
        </div>

        {/* Status Panel */}
        <div className="bg-white rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-semibold">Ready</span>
          </div>
          <div className="flex justify-between">
            <span>Map:</span>
            <span className="font-semibold">United States</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-semibold text-blue-600">📍 Available</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
