/**
 * GET /api/air-quality — Air pollution and AQI data.
 *
 * Query params: lat, lon
 * Returns normalized air quality data including AQI, pollutants, and category.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { validateCoordinates } from '@/lib/validation';
import {
  fetchAirQuality,
  ApiKeyMissingError,
  ProviderError,
  TimeoutError,
} from '@/lib/weather/provider';
import { normalizeAirQuality } from '@/lib/weather/normalize';
import {
  getWeatherCache,
  makeCacheKey,
  DEFAULT_TTLS,
} from '@/lib/weather/cache';
import type { ApiResponse, AirQualityData } from '@/types/weather';


export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<AirQualityData>>> {
  try {
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

    // Cache check
    const cache = getWeatherCache();
    const cacheKey = makeCacheKey('air_quality', lat, lon);
    const cached = cache.get<AirQualityData>(cacheKey);

    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    // Fetch from provider
    const rawAqi = await fetchAirQuality(lat, lon);
    const normalized = normalizeAirQuality(rawAqi);

    // Cache (10 minutes TTL)
    cache.set(cacheKey, normalized, DEFAULT_TTLS.airQuality);

    return NextResponse.json({ success: true, data: normalized });
  } catch (err: unknown) {
    return handleError(err);
  }
}

function handleError(err: unknown): NextResponse<ApiResponse<never>> {
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
    console.error('[air-quality] API key missing');
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
    console.error('[air-quality] Request timed out');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Air quality request timed out. Please try again.',
          retryable: true,
        },
      },
      { status: 504 },
    );
  }

  if (err instanceof ProviderError) {
    console.error('[air-quality] Provider error:', err.message);

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
          message: 'Unable to fetch air quality data from the provider.',
          retryable: true,
        },
      },
      { status: 502 },
    );
  }

  console.error('[air-quality] Unexpected error:', err);
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
