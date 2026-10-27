import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  kmhToMph,
  mphToKmh,
  msToKmh,
  kmhToMs,
  mmToInches,
  inchesToMm,
  hPaToInHg,
  inHgToHPa,
  kmToMiles,
  milesToKm,
  formatTemperature,
  formatWindSpeed,
  formatPressure,
  formatVisibility,
  formatPrecipitation,
  degToCompass,
} from '@/lib/formatting';

describe('Unit Conversion Utilities', () => {
  describe('Temperature conversion', () => {
    it('converts 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it('converts 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it('converts 32°F to 0°C', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it('converts 212°F to 100°C', () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it('formats temperatures correctly with degree symbols', () => {
      expect(formatTemperature(28, 'celsius')).toBe('28°C');
      expect(formatTemperature(0, 'celsius')).toBe('0°C');
      expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
    });
  });

  describe('Wind speed conversion', () => {
    it('converts m/s to km/h correctly', () => {
      expect(msToKmh(10)).toBe(36);
      expect(kmhToMs(36)).toBe(10);
    });

    it('converts km/h to mph correctly', () => {
      expect(Math.round(kmhToMph(100))).toBe(62);
      expect(Math.round(mphToKmh(62.1371))).toBe(100);
    });

    it('formats wind speed with correct labels', () => {
      expect(formatWindSpeed(15, 'km/h')).toBe('15 km/h');
      expect(formatWindSpeed(36, 'm/s')).toBe('10 m/s');
    });
  });

  describe('Precipitation & Pressure conversion', () => {
    it('converts mm to inches', () => {
      expect(Math.round(mmToInches(25.4) * 10) / 10).toBe(1);
      expect(inchesToMm(1)).toBe(25.4);
    });

    it('converts hPa to inHg', () => {
      expect(Math.round(hPaToInHg(1013.25) * 100) / 100).toBe(29.92);
      expect(Math.round(inHgToHPa(29.92))).toBe(1013);
    });

    it('formats pressure correctly', () => {
      expect(formatPressure(1012, 'hPa')).toBe('1012 hPa');
    });

    it('formats precipitation volume', () => {
      expect(formatPrecipitation(4.5, 'mm')).toBe('4.5 mm');
      expect(formatPrecipitation(0, 'mm')).toBe('0.0 mm');
    });
  });

  describe('Visibility & Distance', () => {
    it('converts km to miles', () => {
      expect(Math.round(kmToMiles(10))).toBe(6);
      expect(Math.round(milesToKm(6.21371))).toBe(10);
    });

    it('formats visibility', () => {
      expect(formatVisibility(10, 'km')).toBe('10.0 km');
    });
  });

  describe('Compass direction calculation', () => {
    it('calculates cardinal and intercardinal compass directions correctly', () => {
      expect(degToCompass(0)).toBe('North');
      expect(degToCompass(360)).toBe('North');
      expect(degToCompass(90)).toBe('East');
      expect(degToCompass(180)).toBe('South');
      expect(degToCompass(270)).toBe('West');
      expect(degToCompass(45)).toBe('Northeast');
      expect(degToCompass(225)).toBe('Southwest');
    });
  });
});
