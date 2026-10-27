/**
 * GET /api/geocoding — Search cities and places by name.
 *
 * Query params: q, limit (optional, default 5)
 * Returns normalized geocoding results array.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { validateSearchQuery } from '@/lib/validation';
import {
  fetchGeocoding,
  ApiKeyMissingError,
  ProviderError,
  TimeoutError,
} from '@/lib/weather/provider';
import { normalizeGeocodingResults } from '@/lib/weather/normalize';
import {
  getWeatherCache,
  DEFAULT_TTLS,
} from '@/lib/weather/cache';
import type { ApiResponse, GeocodingResult } from '@/types/weather';


export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<GeocodingResult[]>>> {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q');
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? Math.min(Math.max(parseInt(limitStr, 10) || 5, 1), 10) : 5;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Query parameter "q" is required.',
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: validation.error ?? 'Invalid search query.',
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    // Cache check by sanitized lowercase query
    const cache = getWeatherCache();
    const cacheKey = `geo:${validation.sanitized.toLowerCase()}:${limit}`;
    const cached = cache.get<GeocodingResult[]>(cacheKey);

    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    // Fetch from provider
    const rawResults = await fetchGeocoding(validation.sanitized, limit);
    const normalized = normalizeGeocodingResults(rawResults);

    // Cache (24 hours TTL)
    cache.set(cacheKey, normalized, DEFAULT_TTLS.geocoding);

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
    console.error('[geocoding] API key missing');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_KEY_MISSING',
          message: 'Geocoding service is not configured. Please try again later.',
          retryable: false,
        },
      },
      { status: 503 },
    );
  }

  if (err instanceof TimeoutError) {
    console.error('[geocoding] Request timed out');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Location search timed out. Please try again.',
          retryable: true,
        },
      },
      { status: 504 },
    );
  }

  if (err instanceof ProviderError) {
    console.error('[geocoding] Provider error:', err.message);

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
          message: 'Unable to search locations from the provider.',
          retryable: true,
        },
      },
      { status: 502 },
    );
  }

  console.error('[geocoding] Unexpected error:', err);
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
