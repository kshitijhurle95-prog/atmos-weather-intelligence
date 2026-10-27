/**
 * Simple in-memory cache with per-entry TTL for weather data.
 *
 * Designed for server-side use inside a long-running Node process
 * (e.g. Next.js API routes running in the same worker). The cache is
 * automatically pruned on every read to avoid unbounded growth.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/** Default TTL values (in milliseconds). */
export const DEFAULT_TTLS = {
  currentWeather: 5 * 60 * 1000,   // 5 minutes
  forecast: 15 * 60 * 1000,        // 15 minutes
  geocoding: 24 * 60 * 60 * 1000,  // 24 hours
  airQuality: 10 * 60 * 1000,      // 10 minutes
} as const;

export type CacheCategory = keyof typeof DEFAULT_TTLS;

// ---------------------------------------------------------------------------
// Cache key helpers
// ---------------------------------------------------------------------------

/**
 * Round a coordinate to 2 decimal places (~1.1 km precision) so that
 * nearby requests share the same cache entry.
 */
function roundCoord(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Generate a deterministic cache key from an endpoint label and coordinates.
 */
export function makeCacheKey(endpoint: string, lat: number, lon: number): string {
  return `${endpoint}:${roundCoord(lat)},${roundCoord(lon)}`;
}

/**
 * Generate a cache key from an endpoint and a query string (for geocoding).
 */
export function makeQueryCacheKey(endpoint: string, query: string): string {
  return `${endpoint}:${query.trim().toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// WeatherCache
// ---------------------------------------------------------------------------

export class WeatherCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /** Maximum number of entries before forced eviction of oldest entries. */
  private readonly maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  /**
   * Retrieve a cached value if it exists and has not expired.
   * Returns `undefined` on miss or expiry.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Store a value with the given TTL (milliseconds).
   * If no TTL is provided the entry never expires (use with caution).
   */
  set<T>(key: string, data: T, ttl: number): void {
    // Evict oldest entries if we've hit the cap.
    if (this.store.size >= this.maxSize) {
      this.evictOldest(Math.max(1, Math.floor(this.maxSize * 0.1)));
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /** Check whether a non-expired entry exists for `key`. */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /** Delete a specific key. */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /** Remove all entries. */
  clear(): void {
    this.store.clear();
  }

  /** Number of entries currently stored (including possibly-expired). */
  get size(): number {
    return this.store.size;
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  /** Remove the `count` oldest entries by insertion order. */
  private evictOldest(count: number): void {
    let removed = 0;
    for (const key of this.store.keys()) {
      if (removed >= count) break;
      this.store.delete(key);
      removed++;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

let _instance: WeatherCache | undefined;

/** Get (or create) the global WeatherCache singleton. */
export function getWeatherCache(): WeatherCache {
  if (!_instance) {
    _instance = new WeatherCache();
  }
  return _instance;
}
