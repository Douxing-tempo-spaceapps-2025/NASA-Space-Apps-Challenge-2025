"use client";

import { useEffect, useRef, useState } from "react";
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
  const sourceId = useRef<string>(`fires-source`);
  const pointLayerId = useRef<string>(`fires-point`);

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

  // Build GeoJSON from fireData
  const toGeoJSON = (): GeoJSON.FeatureCollection<GeoJSON.Point, any> => {
    return {
      type: "FeatureCollection",
      features: fireData.map((f) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [f.longitude, f.latitude],
        },
        properties: {
          brightness: f.brightness,
          intensityColor: FireDataService.getFireIntensityColor(f.brightness),
          intensityText: FireDataService.getFireIntensityDescription(
            f.brightness
          ),
          dayNight: FireDataService.getDayNightDescription(f.daynight),
          acqTime: FireDataService.formatAcquisitionTime(
            f.acq_date,
            f.acq_time
          ),
          satellite: f.satellite,
          confidence: f.confidence,
          frp: f.frp,
        },
      })),
    };
  };

  // Add/update source and layers
  useEffect(() => {
    if (!map || fireData.length === 0) return;

    const srcId = sourceId.current;
    const pointId = pointLayerId.current;

    const ensureLayers = () => {
      // Add source if missing
      if (!map.getSource(srcId)) {
        map.addSource(srcId, {
          type: "geojson",
          data: toGeoJSON(),
          // no clustering
        } as any);
      } else {
        const src = map.getSource(srcId) as maplibregl.GeoJSONSource;
        src.setData(toGeoJSON() as any);
      }

      // Points rendered as triangle symbol to distinguish from AQ stations
      if (!map.getLayer(pointId)) {
        map.addLayer({
          id: pointId,
          type: "symbol",
          source: srcId,
          layout: {
            "text-field": "▲",
            "text-size": 14,
            "text-allow-overlap": true,
            visibility: visible ? "visible" : "none",
          },
          paint: {
            "text-color": ["get", "intensityColor"],
            "text-halo-color": "#ffffff",
            "text-halo-width": 1,
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      ensureLayers();
    } else {
      const onLoad = () => ensureLayers();
      map.once("load", onLoad);
    }

    const onPointClick = (e: maplibregl.MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [pointId],
      });
      if (!features.length) return;
      const f = features[0];
      const p = f.properties as any;
      const [lng, lat] = (f.geometry as any).coordinates;

      const popupHtml = `
        <div class="p-3 w-[360px] max-w-none">
          <h3 class="font-semibold text-gray-800 mb-2 flex items-center">
            <span class="text-lg mr-2">🔥</span>
            Fire Detection
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center text-sm">
              <span class="font-medium">Intensity:</span>
              <div class="flex items-center gap-2">
                <span class="font-bold" style="color: ${p.intensityColor}">${
        p.intensityText
      }</span>
                <span class="text-xs text-gray-500">(${Number(
                  p.brightness
                ).toFixed(1)}K)</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="font-medium">Time:</span>
              <span class="text-sm">${p.acqTime}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="font-medium">Period:</span>
              <span class="text-sm">${p.dayNight}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="font-medium">Satellite:</span>
              <span class="text-sm">${p.satellite}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="font-medium">Confidence:</span>
              <span class="text-sm font-medium">${p.confidence}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="font-medium">FRP:</span>
              <span class="text-sm">${Number(p.frp).toFixed(1)} MW</span>
            </div>
          </div>
          <div class="mt-3 pt-2 border-t border-gray-200">
            <p class="text-xs text-gray-500">Coordinates: ${lat.toFixed(
              4
            )}, ${lng.toFixed(4)}</p>
          </div>
        </div>
      `;

      new maplibregl.Popup({
        offset: 12,
        maxWidth: "none",
        className: "fire-popup",
      })
        .setLngLat([lng, lat])
        .setHTML(popupHtml)
        .addTo(map);

      if (onFireClick) {
        onFireClick({
          latitude: lat,
          longitude: lng,
          brightness: Number(p.brightness),
          scan: 0,
          track: 0,
          acq_date: p.acqTime?.split(" ")[0] || "",
          acq_time: (p.acqTime?.split(" ")[1] || "").replace(":", ""),
          satellite: p.satellite,
          confidence: p.confidence,
          version: "",
          bright_t31: 0,
          frp: Number(p.frp),
          daynight: p.dayNight === "Day" ? "D" : "N",
        });
      }
    };

    map.on("click", pointId, onPointClick);

    return () => {
      // Guard against cases where map is undefined/destroyed during unmount
      if (!map) return;
      const hasGetLayer = typeof (map as any).getLayer === "function";
      if (hasGetLayer && map.getLayer(pointId)) {
        map.off("click", pointId, onPointClick);
      }
      // Do not remove layers/sources here; keep for visibility toggling
    };
  }, [map, fireData, visible, onFireClick]);

  // Sync visibility
  useEffect(() => {
    const pointId = pointLayerId.current;
    const vis = visible ? "visible" : "none";
    if (map.getLayer(pointId))
      map.setLayoutProperty(pointId, "visibility", vis);
  }, [map, visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const srcId = sourceId.current;
      const pointId = pointLayerId.current;
      if (!map) return;
      const hasGetLayer = typeof (map as any).getLayer === "function";
      const hasGetSource = typeof (map as any).getSource === "function";
      if (hasGetLayer && map.getLayer(pointId)) map.removeLayer(pointId);
      if (hasGetSource && map.getSource(srcId)) map.removeSource(srcId);
    };
  }, [map]);

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
