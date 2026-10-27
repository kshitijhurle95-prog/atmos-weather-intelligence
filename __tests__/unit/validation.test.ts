import {
  isValidLatitude,
  isValidLongitude,
  validateCoordinates,
  sanitizeString,
  validateSearchQuery,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('Coordinate validation', () => {
    it('accepts valid latitude and longitude', () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(18.5204)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);

      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(73.8567)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);

      const res = validateCoordinates(18.5204, 73.8567);
      expect(res.valid).toBe(true);
    });

    it('rejects latitudes outside [-90, 90]', () => {
      expect(isValidLatitude(-90.1)).toBe(false);
      expect(isValidLatitude(90.1)).toBe(false);

      const res = validateCoordinates(95, 73.8567);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Latitude must be between -90 and 90');
    });

    it('rejects longitudes outside [-180, 180]', () => {
      expect(isValidLongitude(-180.1)).toBe(false);
      expect(isValidLongitude(180.1)).toBe(false);

      const res = validateCoordinates(18.5204, 190);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Longitude must be between -180 and 180');
    });

    it('rejects NaN or non-numeric coordinates', () => {
      expect(validateCoordinates(NaN as any, 73.8567).valid).toBe(false);
      expect(validateCoordinates(18.5204, 'invalid' as any).valid).toBe(false);
    });
  });

  describe('String sanitization & search validation', () => {
    it('strips dangerous HTML tags and script characters', () => {
      const dirty = '<script>alert("xss")</script>Pune';
      const clean = sanitizeString(dirty);
      expect(clean).toBe('alert(xss)Pune');
    });

    it('trims whitespace and collapses multiple spaces', () => {
      expect(sanitizeString('   New    Delhi   ')).toBe('New Delhi');
    });

    it('validates minimum length for search queries', () => {
      expect(validateSearchQuery('a').valid).toBe(false);
      expect(validateSearchQuery('  ').valid).toBe(false);
      expect(validateSearchQuery('London').valid).toBe(true);
      expect(validateSearchQuery('London').sanitized).toBe('London');
    });
  });
});
