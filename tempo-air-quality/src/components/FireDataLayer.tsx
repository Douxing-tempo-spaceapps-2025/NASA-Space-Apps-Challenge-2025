"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { FireDataService, FireDataRecord } from "../services/fireDataService";

interface FireDataLayerProps {
  map: maplibregl.Map;
  onFireClick?: (fire: FireDataRecord) => void;
  visible?: boolean;
}

export default function FireDataLayer({
  map,
  onFireClick,
  visible = true,
}: FireDataLayerProps) {
  const [fireData, setFireData] = useState<FireDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const createFireMarker = useCallback(
    (fire: FireDataRecord): maplibregl.Marker => {
      // Get fire intensity color based on brightness
      const color = FireDataService.getFireIntensityColor(fire.brightness);
      const intensity = FireDataService.getFireIntensityDescription(
        fire.brightness
      );
      const dayNight = FireDataService.getDayNightDescription(fire.daynight);
      const acquisitionTime = FireDataService.formatAcquisitionTime(
        fire.acq_date,
        fire.acq_time
      );

      // Create fire icon element - simple red dot
      const el = document.createElement("div");
      el.className = "fire-marker";

      // Function to update marker size based on zoom level
      const updateMarkerSize = () => {
        const zoom = map.getZoom();
        // Calculate size based on zoom level - make them bigger
        // At zoom 10+: 12px, at zoom 8: 10px, at zoom 6: 8px, at zoom 4: 6px
        // Minimum size: 6px, Maximum size: 12px
        const size = Math.max(6, Math.min(12, 4 + zoom * 0.6));
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      };

      // Initial size
      updateMarkerSize();

      // Get fire intensity color based on brightness
      const fireColor = FireDataService.getFireIntensityColor(fire.brightness);

      el.style.cssText = `
      background-color: ${fireColor};
      border: 1px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      z-index: 1000;
      position: absolute;
      transform: translate(-50%, -50%);
      transition: all 0.2s ease-in-out;
    `;

      // Hover effects - only change shadow and size, no transform
      el.addEventListener("mouseenter", () => {
        el.style.boxShadow = "0 2px 8px rgba(255,68,68,0.6)";
        const currentSize = parseFloat(el.style.width);
        el.style.width = `${currentSize + 2}px`;
        el.style.height = `${currentSize + 2}px`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";
        updateMarkerSize(); // Reset to zoom-based size
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([fire.longitude, fire.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(`
          <div class="p-3 min-w-[250px]">
            <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
              <span class="text-lg mr-2">🔥</span>
              Fire Detection
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium">Intensity:</span>
                <div class="flex items-center gap-2">
                  <span class="font-bold" style="color: ${color}">${intensity}</span>
                  <span class="text-xs text-gray-500">(${fire.brightness.toFixed(
                    1
                  )}K)</span>
                </div>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium">Time:</span>
                <span class="text-sm">${acquisitionTime}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium">Period:</span>
                <span class="text-sm">${dayNight}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium">Satellite:</span>
                <span class="text-sm">${fire.satellite}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium">Confidence:</span>
                <span class="text-sm font-medium">${fire.confidence}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium">FRP:</span>
                <span class="text-sm">${fire.frp.toFixed(1)} MW</span>
              </div>
            </div>
            <div class="mt-3 pt-2 border-t border-gray-200">
              <p class="text-xs text-gray-500">
                Coordinates: ${fire.latitude.toFixed(
                  4
                )}, ${fire.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        `)
        );

      el.addEventListener("click", () => {
        if (onFireClick) {
          onFireClick(fire);
        }
      });

      return marker;
    },
    [onFireClick, map]
  );

  // Fetch fire data
  useEffect(() => {
    const fetchFireData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await FireDataService.getRecentFireData();
        setFireData(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch fire data"
        );
        console.error("Error fetching fire data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFireData();
  }, []);

  // Handle visibility changes
  useEffect(() => {
    if (!map) return;

    if (!visible) {
      // Hide all markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    }
  }, [map, visible]);

  // Create fire markers
  useEffect(() => {
    if (!map || fireData.length === 0 || !visible) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    fireData.forEach((fire) => {
      const fireMarker = createFireMarker(fire);
      fireMarker.addTo(map);
      markersRef.current.push(fireMarker);
    });

    // Add zoom event listener to update marker sizes
    const handleZoom = () => {
      markersRef.current.forEach((marker) => {
        const element = marker.getElement();
        if (element) {
          const zoom = map.getZoom();
          const size = Math.max(6, Math.min(12, 4 + zoom * 0.6));
          element.style.width = `${size}px`;
          element.style.height = `${size}px`;
        }
      });
    };

    map.on("zoom", handleZoom);

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.off("zoom", handleZoom);
    };
  }, [map, fireData, createFireMarker, visible]);

  if (loading) {
    return (
      <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          <span className="text-sm text-gray-600">Loading fire data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-4 left-4 z-10 bg-red-50 border border-red-200 p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return null;
}
