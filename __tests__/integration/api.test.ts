/**
 * @jest-environment node
 */

/**
 * Integration tests for server-side Route Handlers
 */

import { NextRequest } from 'next/server';
import { GET as weatherHandler } from '@/app/api/weather/route';
import { GET as forecastHandler } from '@/app/api/forecast/route';
import { GET as geocodingHandler } from '@/app/api/geocoding/route';
import { GET as airQualityHandler } from '@/app/api/air-quality/route';

describe('Server API Route Handlers', () => {
  const originalEnv = process.env.OPENWEATHER_API_KEY;

  afterEach(() => {
    process.env.OPENWEATHER_API_KEY = originalEnv;
  });

  describe('GET /api/weather', () => {
    it('returns 400 when lat or lon is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/weather?lat=18.52');
      const res = await weatherHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INVALID_PARAMETERS');
    });

    it('returns 400 for out-of-range coordinates', async () => {
      const req = new NextRequest('http://localhost:3000/api/weather?lat=95&lon=73.85');
      const res = await weatherHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INVALID_PARAMETERS');
    });

    it('returns 503 when API key is missing', async () => {
      delete process.env.OPENWEATHER_API_KEY;

      const req = new NextRequest('http://localhost:3000/api/weather?lat=18.52&lon=73.85');
      const res = await weatherHandler(req);
      const json = await res.json();

      expect(res.status).toBe(503);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('API_KEY_MISSING');
    });
  });

  describe('GET /api/forecast', () => {
    it('returns 400 when coordinates are omitted', async () => {
      const req = new NextRequest('http://localhost:3000/api/forecast');
      const res = await forecastHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('returns 503 when API key is missing', async () => {
      delete process.env.OPENWEATHER_API_KEY;

      const req = new NextRequest('http://localhost:3000/api/forecast?lat=18.52&lon=73.85');
      const res = await forecastHandler(req);
      const json = await res.json();

      expect(res.status).toBe(503);
      expect(json.error.code).toBe('API_KEY_MISSING');
    });
  });

  describe('GET /api/geocoding', () => {
    it('returns 400 when query parameter "q" is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/geocoding');
      const res = await geocodingHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error.code).toBe('INVALID_PARAMETERS');
    });

    it('returns 400 when query parameter is too short', async () => {
      const req = new NextRequest('http://localhost:3000/api/geocoding?q=a');
      const res = await geocodingHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error.code).toBe('INVALID_PARAMETERS');
    });

    it('returns 503 when API key is missing', async () => {
      delete process.env.OPENWEATHER_API_KEY;

      const req = new NextRequest('http://localhost:3000/api/geocoding?q=Pune');
      const res = await geocodingHandler(req);
      const json = await res.json();

      expect(res.status).toBe(503);
      expect(json.error.code).toBe('API_KEY_MISSING');
    });
  });

  describe('GET /api/air-quality', () => {
    it('returns 400 for invalid longitude', async () => {
      const req = new NextRequest('http://localhost:3000/api/air-quality?lat=18.52&lon=200');
      const res = await airQualityHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error.code).toBe('INVALID_PARAMETERS');
    });
  });
});
