/**
 * GET /api/weather — Current weather data.
 *
 * Query params: lat, lon
 * Returns normalized current weather with reverse-geocoded location info.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { validateCoordinates } from '@/lib/validation';
import {
  fetchCurrentWeather,
  fetchReverseGeocode,
  ApiKeyMissingError,
  ProviderError,
  TimeoutError,
} from '@/lib/weather/provider';
import { normalizeCurrentWeather } from '@/lib/weather/normalize';
import {
  getWeatherCache,
  makeCacheKey,
  DEFAULT_TTLS,
} from '@/lib/weather/cache';
import type { ApiResponse } from '@/types/weather';
import type { NormalizedCurrentWeather } from '@/lib/weather/normalize';


export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<NormalizedCurrentWeather>>> {
  try {
    // -----------------------------------------------------------------------
    // 1. Parse & validate query parameters
    // -----------------------------------------------------------------------
    const { searchParams } = request.nextUrl;
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    if (!latStr || !lonStr) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Both "lat" and "lon" query parameters are required.',
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    const validation = validateCoordinates(lat, lon);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: validation.error ?? 'Invalid coordinates.',
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // 2. Check cache
    // -----------------------------------------------------------------------
    const cache = getWeatherCache();
    const cacheKey = makeCacheKey('weather', lat, lon);
    const cached = cache.get<NormalizedCurrentWeather>(cacheKey);

    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    // -----------------------------------------------------------------------
    // 3. Fetch from provider
    // -----------------------------------------------------------------------
    const [rawWeather, geoResults] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchReverseGeocode(lat, lon).catch(() => []),
    ]);

    const geoInfo = geoResults[0] ?? undefined;
    const normalized = normalizeCurrentWeather(rawWeather, geoInfo);

    // -----------------------------------------------------------------------
    // 4. Cache & return
    // -----------------------------------------------------------------------
    cache.set(cacheKey, normalized, DEFAULT_TTLS.currentWeather);

    return NextResponse.json({ success: true, data: normalized });
  } catch (err: unknown) {
    return handleError(err);
  }
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

function handleError(
  err: unknown,
): NextResponse<ApiResponse<never>> {
  if (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof (err as { digest?: unknown }).digest === 'string' &&
    ((err as { digest: string }).digest.startsWith('NEXT_') ||
      (err as { digest: string }).digest.includes('BAILOUT'))
  ) {
    throw err;
  }

  if (err instanceof ApiKeyMissingError) {
    console.error('[weather] API key missing');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_KEY_MISSING',
          message: 'Weather service is not configured. Please try again later.',
          retryable: false,
        },
      },
      { status: 503 },
    );
  }

  if (err instanceof TimeoutError) {
    console.error('[weather] Request timed out');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Weather data request timed out. Please try again.',
          retryable: true,
        },
      },
      { status: 504 },
    );
  }

  if (err instanceof ProviderError) {
    console.error('[weather] Provider error:', err.message);

    if (err.statusCode === 429) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please wait a moment and try again.',
            retryable: true,
          },
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROVIDER_ERROR',
          message: 'Unable to fetch weather data from the provider.',
          retryable: true,
        },
      },
      { status: 502 },
    );
  }

  console.error('[weather] Unexpected error:', err);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
        retryable: false,
      },
    },
    { status: 500 },
  );
}
