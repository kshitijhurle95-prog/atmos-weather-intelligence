'use client';

import React from 'react';
import {
  Bookmark,
  Trash2,
  Star,
  MapPin,
  ExternalLink,
  PlusCircle,
  Compass,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useWeatherContext } from '@/context/WeatherContext';
import type { SavedLocation } from '@/hooks/useFavorites';

export interface SavedLocationsProps {
  onSelectLocation?: (loc: SavedLocation) => void;
}

export function SavedLocations({ onSelectLocation }: SavedLocationsProps) {
  const {
    favorites,
    removeFavorite,
    setDefaultLocation,
    fetchWeatherForLocation,
    currentLocation,
  } = useWeatherContext();

  const handleSelect = async (fav: SavedLocation) => {
    if (onSelectLocation) {
      onSelectLocation(fav);
    } else {
      await fetchWeatherForLocation(fav.lat, fav.lon, fav.name, fav.country);
    }
  };

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Saved Locations & Favorites
            </h2>
            <p className="text-xs text-slate-400">
              Quick access to your monitored regional weather stations
            </p>
          </div>
        </div>
        <Badge variant="outline" size="sm">
          {favorites.length} / 10 Saved
        </Badge>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
          <MapPin className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-semibold text-white mb-1">
            No Saved Locations Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            Search for any city worldwide using the top search bar and tap the heart icon on the hero banner to pin it to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {favorites.map((fav) => {
            const isCurrent =
              currentLocation &&
              Math.abs(currentLocation.lat - fav.lat) < 0.05 &&
              Math.abs(currentLocation.lon - fav.lon) < 0.05;

            return (
              <div
                key={fav.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-500/10'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-base truncate">
                          {fav.name}
                        </span>
                        {fav.isDefault && (
                          <span
                            title="Default launch location"
                            className="p-0.5 rounded bg-amber-500/20 text-amber-300"
                          >
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {fav.region ? `${fav.region}, ` : ''}
                        {fav.country}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Set as default button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultLocation(fav.id);
                        }}
                        title={
                          fav.isDefault
                            ? 'Default location'
                            : 'Set as default launch city'
                        }
                        className={`p-1.5 rounded-lg transition ${
                          fav.isDefault
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-500 hover:text-amber-400 hover:bg-white/5'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            fav.isDefault ? 'fill-amber-400' : ''
                          }`}
                        />
                      </button>

                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(fav.id);
                        }}
                        title="Remove from favorites"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-2">
                    <Compass className="w-3 h-3 text-sky-400" />
                    <span>
                      {fav.lat.toFixed(2)}°, {fav.lon.toFixed(2)}°
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Added: {new Date(fav.addedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleSelect(fav)}
                    className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
                  >
                    <span>{isCurrent ? 'Viewing Now' : 'Load Weather'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
