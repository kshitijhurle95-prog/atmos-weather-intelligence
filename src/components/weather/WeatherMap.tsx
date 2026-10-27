'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Layers, Info, AlertCircle, Compass } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface WeatherMapProps {
  lat: number;
  lon: number;
  cityName?: string;
}

type MapLayer = 'precipitation_new' | 'clouds_new' | 'temp_new' | 'wind_new';

export function WeatherMap({ lat, lon, cityName }: WeatherMapProps) {
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>('clouds_new');
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const weatherTileLayerRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let mounted = true;

    // Dynamically import leaflet to prevent SSR issues
    import('leaflet')
      .then((L) => {
        if (!mounted || !mapContainerRef.current) return;

        // Clean up previous instance if exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        try {
          // Initialize map centered at current coordinates
          const map = L.map(mapContainerRef.current, {
            center: [lat, lon],
            zoom: 8,
            minZoom: 3,
            maxZoom: 18,
            zoomControl: true,
          });

          // Add base OpenStreetMap tiles
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          }).addTo(map);

          // Add location marker
          const markerIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `
              <div style="background-color: #38BDF8; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(56,189,248,0.8);"></div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          L.marker([lat, lon], { icon: markerIcon })
            .addTo(map)
            .bindPopup(`<b>${cityName || 'Location'}</b><br/>${lat.toFixed(2)}°, ${lon.toFixed(2)}°`)
            .openPopup();

          mapInstanceRef.current = map;
        } catch (err: any) {
          console.error('[WeatherMap] Leaflet initialization error:', err);
          setMapError('Interactive map rendering encountered an issue.');
        }
      })
      .catch((err) => {
        console.error('[WeatherMap] Leaflet load failed:', err);
        setMapError('Leaflet mapping library could not be loaded.');
      });

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, lat, lon, cityName]);

  const layers: Array<{ id: MapLayer; label: string; desc: string }> = [
    { id: 'clouds_new', label: 'Cloud Cover', desc: 'Satellite cloud opacity' },
    { id: 'precipitation_new', label: 'Precipitation', desc: 'Rain & snowfall radar' },
    { id: 'temp_new', label: 'Temperature', desc: 'Thermal isotherm gradients' },
    { id: 'wind_new', label: 'Wind Velocity', desc: 'Global stream vectors' },
  ];

  return (
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <MapIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Interactive Regional Weather Radar & Map
            </h2>
            <p className="text-xs text-slate-400">
              High-resolution spatial telemetry centered at {cityName || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}
            </p>
          </div>
        </div>

        {/* Layer Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLayer(l.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedLayer === l.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-white/10 bg-[#0B1220]">
        {!isClient ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            Initializing map canvas...
          </div>
        ) : mapError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
            <p className="font-semibold text-white">{mapError}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Verify WebGL/canvas support or check network access to Carto/OpenStreetMap tile servers.
            </p>
          </div>
        ) : (
          <>
            {/* The actual Leaflet container */}
            <div
              ref={mapContainerRef}
              className="w-full h-full z-0"
              style={{ minHeight: '100%' }}
            />

            {/* Overlay Notice */}
            <div className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-[#0B1220]/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 shadow-lg flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Layer: {layers.find((l) => l.id === selectedLayer)?.label}</span>
            </div>

            {/* Legend at bottom left */}
            <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl bg-[#0B1220]/90 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 shadow-xl space-y-1">
              <span className="font-semibold text-white block">Legend</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-sky-400" />
                <span>Station Pin ({cityName || 'Target'})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                <span>Carto Voyager GIS Base</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>
          Tile sources: &copy; OpenStreetMap contributors, CartoDB, and OpenWeather atmospheric overlays.
        </span>
        <span className="font-mono">
          {lat.toFixed(4)}°, {lon.toFixed(4)}°
        </span>
      </div>
    </Card>
  );
}
