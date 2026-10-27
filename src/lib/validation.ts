/**
 * Input validation and sanitization utilities for the Atmos platform.
 */

// ---------------------------------------------------------------------------
// Coordinate validation
// ---------------------------------------------------------------------------

/** Check whether a latitude value is within the valid range [−90, 90]. */
export function isValidLatitude(lat: number): boolean {
  return typeof lat === 'number' && !Number.isNaN(lat) && lat >= -90 && lat <= 90;
}

/** Check whether a longitude value is within the valid range [−180, 180]. */
export function isValidLongitude(lon: number): boolean {
  return typeof lon === 'number' && !Number.isNaN(lon) && lon >= -180 && lon <= 180;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface SearchValidationResult extends ValidationResult {
  sanitized: string;
}

/**
 * Validate a latitude / longitude pair.
 */
export function validateCoordinates(lat: number, lon: number): ValidationResult {
  if (typeof lat !== 'number' || Number.isNaN(lat)) {
    return { valid: false, error: 'Latitude must be a valid number.' };
  }
  if (typeof lon !== 'number' || Number.isNaN(lon)) {
    return { valid: false, error: 'Longitude must be a valid number.' };
  }
  if (!isValidLatitude(lat)) {
    return { valid: false, error: `Latitude must be between -90 and 90. Received: ${lat}` };
  }
  if (!isValidLongitude(lon)) {
    return { valid: false, error: `Longitude must be between -180 and 180. Received: ${lon}` };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// String sanitization
// ---------------------------------------------------------------------------

/** Maximum allowed length for user-supplied strings. */
const MAX_STRING_LENGTH = 200;

/**
 * Sanitize a user-supplied string:
 * - Trim leading/trailing whitespace
 * - Truncate to `maxLength` characters
 * - Strip HTML tags (basic XSS prevention)
 * - Collapse repeated whitespace
 */
export function sanitizeString(str: string, maxLength = MAX_STRING_LENGTH): string {
  if (typeof str !== 'string') return '';

  return str
    .trim()
    .slice(0, maxLength)
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove potentially dangerous characters / script patterns
    .replace(/[<>"'`]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Search query validation
// ---------------------------------------------------------------------------

/** Minimum query length after sanitization. */
const MIN_SEARCH_LENGTH = 2;

/**
 * Validate and sanitize a location search query.
 */
export function validateSearchQuery(query: string): SearchValidationResult {
  if (typeof query !== 'string') {
    return { valid: false, sanitized: '', error: 'Search query must be a string.' };
  }

  const sanitized = sanitizeString(query, 100);

  if (sanitized.length < MIN_SEARCH_LENGTH) {
    return {
      valid: false,
      sanitized,
      error: `Search query must be at least ${MIN_SEARCH_LENGTH} characters.`,
    };
  }

  return { valid: true, sanitized };
}
