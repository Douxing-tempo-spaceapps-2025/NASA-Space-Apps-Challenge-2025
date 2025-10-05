"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";
import {
  AirQualityService,
  ProcessedStation,
} from "../services/airQualityService";

interface ClusterFeature {
  type: "Feature";
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string;
    station?: ProcessedStation;
    index?: number;
    avgAQI?: number;
    maxAQI?: number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

interface AirQualityClusterLayerProps {
  map: maplibregl.Map;
  onStationClick?: (station: ProcessedStation) => void;
  visible?: boolean;
}

export default function AirQualityClusterLayer({
  map,
  onStationClick,
  visible = true,
}: AirQualityClusterLayerProps) {
  const [stations, setStations] = useState<ProcessedStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clusterRef = useRef<Supercluster | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Fetch stations data
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AirQualityService.getAllStations();
        setStations(data.stations);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch stations"
        );
        console.error("Error fetching stations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Initialize supercluster
  useEffect(() => {
    if (stations.length === 0) return;

    // Filter and convert stations to GeoJSON features (US only)

    const features: ClusterFeature[] = stations
      .filter((station) => {
        // Filter to US only: roughly US bounds
        const [lng, lat] = station.coordinates;
        const isInUS =
          lng >= -180 &&
          lng <= -65 && // Longitude bounds for US
          lat >= 18 &&
          lat <= 72; // Latitude bounds for US (including Alaska and Hawaii)
        return isInUS;
      })
      .map((station, index) => {
        // Calculate the maximum AQI value from all pollutants for this station
        const maxAQI = Math.max(
          ...Object.values(station.pollutants).map((p) => p.value)
        );

        // Validate station coordinates (only log errors)
        const [lng, lat] = [station.coordinates[0], station.coordinates[1]];
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          console.error(
            "AirQualityClusterLayer: Invalid station coordinates:",
            {
              station: `${station.city}, ${station.state}`,
              coordinates: station.coordinates,
              lng,
              lat,
            }
          );
        }

        return {
          type: "Feature",
          properties: {
            cluster: false,
            station: station,
            index: index,
            maxAQI: maxAQI,
          },
          geometry: {
            type: "Point",
            coordinates: [station.coordinates[0], station.coordinates[1]], // [lng, lat]
          },
        };
      });

    // Initialize supercluster
    clusterRef.current = new Supercluster({
      radius: 50, // 50px cluster radius
      maxZoom: 14, // Max zoom to cluster points - allow full expansion
      minZoom: 0,
      minPoints: 2, // Minimum points to form a cluster (allow 2 stations to show separately)
    });

    clusterRef.current.load(features);
  }, [stations]);

  // Handle visibility changes
  useEffect(() => {
    if (!map) return;

    if (!visible) {
      // Hide all markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    }
  }, [map, visible]);

  // Update clusters when map moves or zooms
  useEffect(() => {
    if (!clusterRef.current || !map || !visible) return;

    // State variables to track last zoom level and bounds
    let lastZoom: number | undefined;
    let lastBounds: maplibregl.LngLatBounds | undefined;

    const calculateClusterAQI = (
      cluster: ClusterFeature
    ): { avgAQI: number; maxAQI: number } => {
      // Use supercluster's built-in getLeaves to get all bottom-level points
      const leaves = clusterRef.current!.getLeaves(
        cluster.properties.cluster_id!,
        Infinity
      );
      const values = leaves.map((leaf) => leaf.properties.maxAQI ?? 0);

      if (values.length === 0) return { avgAQI: 0, maxAQI: 0 };

      const avgAQI = values.reduce((a, b) => a + b, 0) / values.length;
      const maxAQI = Math.max(...values);
      return { avgAQI: Math.round(avgAQI), maxAQI };
    };

    const createClusterMarker = (
      coordinates: [number, number],
      pointCount: number,
      avgAQI: number,
      maxAQI: number
    ): maplibregl.Marker => {
      // Size based on point count (15-40px range) - reduced max size
      const size = Math.min(Math.max(pointCount * 1.2, 15), 40);

      // Color based on AVERAGE AQI
      const color = AirQualityService.getAQIColor(avgAQI);
      const avgCategory = AirQualityService.getAQICategory(avgAQI);

      const el = document.createElement("div");
      el.className = "cluster-marker";
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s ease-in-out;
        z-index: 1;
      `;

      // Create tooltip element
      const tooltip = document.createElement("div");
      tooltip.className = "cluster-tooltip";
      tooltip.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        z-index: 9999;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
      `;
      tooltip.innerHTML = `
            <div class="font-semibold">${pointCount} stations</div>
            <div class="text-xs opacity-90">Avg AQI: ${avgAQI} (${avgCategory})</div>
            <div class="text-xs opacity-70">Max AQI: ${maxAQI}</div>
          `;

      // Add tooltip to marker element
      el.appendChild(tooltip);

      // Hover effects
      el.addEventListener("mouseenter", () => {
        tooltip.style.opacity = "1";
        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
      });

      el.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      });

      const marker = new maplibregl.Marker({ element: el }).setLngLat(
        coordinates
      );

      el.addEventListener("click", () => {
        map.flyTo({
          center: coordinates,
          zoom: Math.min(map.getZoom() + 2, 14),
          duration: 1000,
        });
      });

      return marker;
    };

    const createStationMarker = (
      coordinates: [number, number],
      station: ProcessedStation
    ): maplibregl.Marker => {
      // Get the highest AQI value from all pollutants
      const maxAQI = Math.max(
        ...Object.values(station.pollutants).map((p) => p.value)
      );
      const color = AirQualityService.getAQIColor(maxAQI);
      const category = AirQualityService.getAQICategory(maxAQI);

      const el = document.createElement("div");
      el.className = "station-marker";
      el.style.cssText = `
        width: 12px;
        height: 12px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        z-index: 2;
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coordinates)
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(`
            <div class="p-3 min-w-[200px]">
              <h3 class="font-semibold text-gray-800 mb-2">${station.city}, ${
            station.state
          }</h3>
              <div class="space-y-1">
                ${Object.entries(station.pollutants)
                  .map(
                    ([pollutant, data]) => `
                      <div class="flex justify-between items-center text-sm">
                        <span class="font-medium">${pollutant}:</span>
                        <div class="flex items-center gap-2">
                          <span class="font-bold" style="color: ${AirQualityService.getAQIColor(
                            data.value
                          )}">${data.value}</span>
                          <span class="text-xs text-gray-500">${
                            data.category
                          }</span>
                        </div>
                      </div>
                    `
                  )
                  .join("")}
              </div>
              <div class="mt-2 pt-2 border-t border-gray-200">
                <p class="text-xs text-gray-500">
                  Overall: <span style="color: ${color}" class="font-medium">${category}</span>
                </p>
              </div>
            </div>
          `)
        );

      el.addEventListener("click", () => {
        if (onStationClick) {
          onStationClick(station);
        }
      });

      return marker;
    };

    const updateClusters = () => {
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ] as [number, number, number, number];

      // Check if update is needed (only update when zoom level or bounds change significantly)
      const stableZoom = Math.floor(zoom * 2) / 2; // Round to nearest 0.5

      // More lenient bounds checking for smoother interaction
      const boundsChanged =
        !lastBounds ||
        Math.abs(bounds.getWest() - lastBounds.getWest()) > 0.005 ||
        Math.abs(bounds.getSouth() - lastBounds.getSouth()) > 0.005 ||
        Math.abs(bounds.getEast() - lastBounds.getEast()) > 0.005 ||
        Math.abs(bounds.getNorth() - lastBounds.getNorth()) > 0.005;

      const zoomChanged = Math.abs(zoom - (lastZoom || 0)) > 0.05;

      // Skip update if no significant change
      if (!boundsChanged && !zoomChanged) {
        return;
      }

      // Record current state
      lastZoom = zoom;
      lastBounds = bounds;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      const clusters = clusterRef.current!.getClusters(
        bbox,
        Math.floor(stableZoom)
      );

      clusters.forEach((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates; // [longitude, latitude]
        const { cluster: isCluster, point_count } = cluster.properties;

        // Validate coordinates (only log errors in development)
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          console.error("AirQualityClusterLayer: Invalid coordinates:", {
            lng,
            lat,
          });
        }

        if (isCluster) {
          // Calculate average and max AQI for the cluster
          const clusterAQI = calculateClusterAQI(cluster as ClusterFeature);
          const clusterMarker = createClusterMarker(
            [lng, lat],
            point_count || 0,
            clusterAQI.avgAQI,
            clusterAQI.maxAQI
          );
          clusterMarker.addTo(map);
          markersRef.current.push(clusterMarker);
        } else {
          // Create individual station marker
          const station = cluster.properties.station as ProcessedStation;
          if (station) {
            const stationMarker = createStationMarker([lng, lat], station);
            stationMarker.addTo(map);
            markersRef.current.push(stationMarker);
          }
        }
      });
    };

    // Debounce cluster updates to reduce jitter
    let updateTimeout: NodeJS.Timeout;
    const debouncedUpdateClusters = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(updateClusters, 50); // Reduced to 50ms for better responsiveness
    };

    // Immediate update for smooth interaction
    const immediateUpdateClusters = () => {
      clearTimeout(updateTimeout);
      updateClusters();
    };

    // Update clusters on map events with both immediate and debounced updates
    map.on("move", immediateUpdateClusters);
    map.on("zoom", immediateUpdateClusters);
    map.on("moveend", debouncedUpdateClusters);
    map.on("zoomend", debouncedUpdateClusters);

    // Initial update
    updateClusters();

    return () => {
      clearTimeout(updateTimeout);
      map.off("move", immediateUpdateClusters);
      map.off("zoom", immediateUpdateClusters);
      map.off("moveend", debouncedUpdateClusters);
      map.off("zoomend", debouncedUpdateClusters);
    };
  }, [map, onStationClick, stations.length, visible]);

  if (loading) {
    return (
      <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">
            Loading air quality stations...
          </span>
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
