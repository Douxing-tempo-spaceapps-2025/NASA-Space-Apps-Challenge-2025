"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import AirQualityClusterLayer from "./AirQualityClusterLayer";
import FireDataLayer from "./FireDataLayer";
import MapControls from "./MapControls";
import { ProcessedStation } from "../services/airQualityService";
import { FireDataRecord } from "../services/fireDataService";
import { PrecipitationService } from "../services/precipitationService";
import { TemperatureService } from "../services/temperatureService";
import { HumidityService } from "../services/humidityService";

interface MapBaseProps {
  onMapReady: (map: maplibregl.Map) => void;
  onLocationSelect?: (location: {
    longitude: number;
    latitude: number;
    name?: string;
  }) => void;
}

export default function MapBase({
  onMapReady,
  onLocationSelect,
}: MapBaseProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [showFireData, setShowFireData] = useState(true);
  const [showAirQuality, setShowAirQuality] = useState(true);
  const [showPrecipitation, setShowPrecipitation] = useState(true);
  const [showTemperature, setShowTemperature] = useState(true);
  const [showHumidity, setShowHumidity] = useState(true);

  // Keep refs of layer toggles to avoid re-creating the map on toggle
  const showPrecipitationRef = useRef(showPrecipitation);
  const showTemperatureRef = useRef(showTemperature);
  const showHumidityRef = useRef(showHumidity);

  useEffect(() => {
    showPrecipitationRef.current = showPrecipitation;
    showTemperatureRef.current = showTemperature;
    showHumidityRef.current = showHumidity;
  }, [showPrecipitation, showTemperature, showHumidity]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [-98, 39],
      zoom: 3.5,
    });

    mapRef.current = map;

    // Initial cursor style; will be kept in sync by another effect
    const mapCanvas = map.getCanvas();
    mapCanvas.style.cursor = showPrecipitationRef.current ? "crosshair" : "";

    map.on("load", () => {
      setMapInstance(map);
      onMapReady(map);

      // Add click event for weather data
      map.on("click", async (e) => {
        // Only handle clicks if at least one weather layer is enabled (read latest via refs)
        if (
          !showPrecipitationRef.current &&
          !showTemperatureRef.current &&
          !showHumidityRef.current
        )
          return;

        const { lng, lat } = e.lngLat;

        // Remove existing popup if any
        if (popupRef.current) {
          popupRef.current.remove();
        }

        // Create loading popup
        const loadingPopup = new maplibregl.Popup({
          closeOnClick: false,
          className: "weather-popup",
          maxWidth: "none",
        })
          .setLngLat([lng, lat])
          .setHTML(
            '<div class="p-4 w-[250px] text-sm">Loading weather data...</div>'
          )
          .addTo(map);

        // Store popup reference
        popupRef.current = loadingPopup;

        // Clear popup reference when popup is closed
        loadingPopup.on("close", () => {
          popupRef.current = null;
        });

        try {
          // Build popup content
          let popupContent = `
            <div class="p-4 min-w-[150px]">
              <p class="text-sm mb-2"><strong>Longitude:</strong> ${lng.toFixed(
                4
              )}, <strong>Latitude:</strong> ${lat.toFixed(4)}</p>
          `;

          // Fetch precipitation data if enabled
          if (showPrecipitationRef.current) {
            try {
              const precipData =
                await PrecipitationService.getCurrentPrecipitationByLocation(
                  lng,
                  lat
                );
              popupContent += `
                <div class="mb-2 p-2 bg-cyan-50 rounded">
                  <p class="text-sm font-semibold text-cyan-800">Precipitation (1 Days)</p>
                  <p class="text-sm">${PrecipitationService.formatPrecipitation(
                    precipData.total_precipitation_mm
                  )}</p>
                </div>
              `;
            } catch (error) {
              popupContent += `
                <div class="mb-2 p-2 bg-red-50 rounded">
                  <p class="text-sm font-semibold text-red-800">Precipitation</p>
                  <p class="text-sm text-red-600">Failed to load data</p>
                </div>
              `;
            }
          }

          // Fetch temperature data if enabled
          if (showTemperatureRef.current) {
            try {
              const tempData =
                await TemperatureService.getCurrentTemperatureByLocation(
                  lng,
                  lat
                );
              popupContent += `
                <div class="mb-2 p-2 bg-orange-50 rounded">
                  <p class="text-sm font-semibold text-orange-800">Temperature</p>
                  <p class="text-sm">${TemperatureService.formatTemperature(
                    tempData.temperature
                  )}</p>
                </div>
              `;
            } catch (error) {
              popupContent += `
                <div class="mb-2 p-2 bg-red-50 rounded">
                  <p class="text-sm font-semibold text-red-800">Temperature</p>
                  <p class="text-sm text-red-600">Failed to load data</p>
                </div>
              `;
            }
          }

          // Fetch humidity data if enabled
          if (showHumidityRef.current) {
            try {
              const humidityData =
                await HumidityService.getCurrentHumidityByLocation(lng, lat);
              popupContent += `
                <div class="mb-2 p-2 bg-blue-50 rounded">
                  <p class="text-sm font-semibold text-blue-800">Humidity</p>
                  <p class="text-sm">${HumidityService.formatHumidity(
                    humidityData.relative_humidity
                  )}</p>
                  <p class="text-xs text-gray-600">Dew Point: ${HumidityService.formatDewPoint(
                    humidityData.dew_point_celsius
                  )}</p>
                </div>
              `;
            } catch (error) {
              popupContent += `
                <div class="mb-2 p-2 bg-red-50 rounded">
                  <p class="text-sm font-semibold text-red-800">Humidity</p>
                  <p class="text-sm text-red-600">Failed to load data</p>
                </div>
              `;
            }
          }

          popupContent += "</div>";
          loadingPopup.setHTML(popupContent);
        } catch (error) {
          console.error("Failed to fetch weather data:", error);
          loadingPopup.setHTML(`
            <div class="p-4 min-w-[200px]">
              <p class="text-sm mb-1"><strong>Longitude:</strong> ${lng.toFixed(
                4
              )}</p>
              <p class="text-sm mb-1"><strong>Latitude:</strong> ${lat.toFixed(
                4
              )}</p>
              <p class="text-sm text-red-600">Failed to load weather data</p>
            </div>
          `);
        }

        // Notify parent component about location selection
        if (onLocationSelect) {
          onLocationSelect({
            longitude: lng,
            latitude: lat,
          });
        }
      });
    });

    return () => map.remove();
  }, [onMapReady]);

  // Update cursor style when weather layers change (without re-creating map)
  useEffect(() => {
    if (mapRef.current) {
      const mapCanvas = mapRef.current.getCanvas();
      if (showPrecipitation || showTemperature || showHumidity) {
        mapCanvas.style.cursor = "crosshair";
      } else {
        mapCanvas.style.cursor = "";
      }
    }
  }, [showPrecipitation, showTemperature, showHumidity]);

  const handleStationClick = (station: ProcessedStation) => {
    if (!mapRef.current) return;

    // Fly to station location
    mapRef.current.flyTo({
      center: [station.coordinates[0], station.coordinates[1]], // [lng, lat]
      zoom: 12,
      duration: 1500,
    });
  };

  const handleFireClick = (fire: FireDataRecord) => {
    if (!mapRef.current) return;

    // Fly to fire location
    mapRef.current.flyTo({
      center: [fire.longitude, fire.latitude], // [lng, lat]
      zoom: 12,
      duration: 1500,
    });
  };

  const handleLocateMe = () => {
    if (!mapRef.current) return;

    // Request user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Notify parent component
          if (onLocationSelect) {
            onLocationSelect({
              longitude,
              latitude,
              name: "Your Location",
            });
          }

          // Fly to user location
          mapRef.current!.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            duration: 2000,
          });

          // Add user location marker
          const userMarker = new maplibregl.Marker({
            color: "#3B82F6",
            scale: 1.2,
          })
            .setLngLat([longitude, latitude])
            .addTo(mapRef.current!);

          // Create popup
          const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-blue-600 flex items-center">
                  <img src="/maps.png" alt="Location" class="w-4 h-4 mr-1 object-contain" />
                  Your Location
                </h3>
                <p class="text-sm text-gray-600">Latitude: ${latitude.toFixed(
                  4
                )}</p>
                <p class="text-sm text-gray-600">Longitude: ${longitude.toFixed(
                  4
                )}</p>
              </div>
            `);

          userMarker.setPopup(popup);

          // Remove marker after 10 seconds
          setTimeout(() => {
            userMarker.remove();
          }, 10000);
        },
        (error) => {
          console.error("Location failed:", error);
          alert(
            "Failed to get your location. Please check your browser permissions."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Air Quality Cluster Layer */}
      {mapInstance && (
        <AirQualityClusterLayer
          map={mapInstance!}
          onStationClick={handleStationClick}
          visible={showAirQuality}
        />
      )}

      {/* Fire Data Layer */}
      {mapInstance && (
        <FireDataLayer
          map={mapInstance!}
          onFireClick={handleFireClick}
          visible={showFireData}
        />
      )}

      {/* Map Controls */}
      <MapControls
        showFireData={showFireData}
        showAirQuality={showAirQuality}
        showPrecipitation={showPrecipitation}
        showTemperature={showTemperature}
        showHumidity={showHumidity}
        onToggleFireData={setShowFireData}
        onToggleAirQuality={setShowAirQuality}
        onTogglePrecipitation={setShowPrecipitation}
        onToggleTemperature={setShowTemperature}
        onToggleHumidity={setShowHumidity}
        onLocateMe={handleLocateMe}
      />

      {/* Removed standalone location button; now integrated into MapControls */}
    </div>
  );
}
