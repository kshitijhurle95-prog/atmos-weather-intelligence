# Atmos — Weather Intelligence Platform

**Atmos** is a modern, production-grade weather intelligence platform built with Next.js 16 (App Router), React 19, TypeScript (strict mode), Tailwind CSS, Recharts, and Leaflet. It delivers real-time weather observations, interactive 24-hour hourly timelines, multi-day forecasts, severe meteorological warnings, air quality telemetry, interactive GIS radar maps, deterministic AI-like weather insights, and activity-based day planning.

---

## 🌤️ Highlights & Features

1. **Live Weather Telemetry**
   - Precise temperature, feels-like temperature, daily high/low.
   - Atmospheric condition icon and descriptive state.
   - Dynamic atmospheric backgrounds adapted to weather condition and day/night cycle.
   - Comprehensive metric grid: Humidity, Wind Speed, Wind Direction (compass bearings), Barometric Pressure, Cloud Cover, Visibility, UV Index, and Precipitation Volume.

2. **24-Hour Interactive Timeline & Trends**
   - Horizontally scrollable 24-hour forecast cards with current hour highlight.
   - Detailed interactive hour inspector (humidity, wind velocity, direction).
   - Recharts-powered Temperature Area Trend Chart with smooth gradients.
   - Precipitation Probability (%) Bar Chart.

3. **Multi-Day Outlook (Verified Forecast)**
   - 5-day daily forecast derived directly from provider forecast intervals without fabricated data.
   - Visual relative temperature range bars illustrating daily min/max against the weekly temperature envelope.
   - Expandable day cards revealing sunrise/sunset, average humidity, and wind conditions.

4. **Weather Insights & Activity Index ("Plan Your Day")**
   - **Weather Insights**: Deterministic AI-like analysis derived strictly from numeric forecast fields (e.g. afternoon vs morning rain probabilities, thermal day-over-day changes, wind advisories).
   - **Activity Index**: Pragmatic readiness guidance for outdoor recreation, running/exercise, commuting, rain gear necessity, and highway travel.

5. **Global City Search & Geolocation**
   - Forward geocoding with debounced auto-complete dropdown and keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
   - Disambiguation by city name, regional state, and country code with coordinate badges.
   - Browser geolocation integration with explicit consent handling, permission denial feedback, and error recovery.

6. **Air Quality Index (AQI) Telemetry**
   - Standard 5-tier European/OpenWeather AQI scale (Good, Fair, Moderate, Poor, Very Poor).
   - Real-time concentration breakdown for 6 individual pollutants: PM2.5, PM10, O₃ (Ozone), NO₂, SO₂, and CO.
   - Health risk categorization and outdoor safety guidance.

7. **Interactive Weather Radar & GIS Maps**
   - Leaflet-powered GIS mapping centered at the user's active coordinates.
   - Layer toggles for Cloud Cover, Precipitation Radar, Isotherm Temperatures, and Wind Vectors.
   - CartoDB Voyager base tiles with station markers and legends.

8. **Saved Locations & Preferences**
   - Pin up to 10 favorite cities with local storage persistence.
   - Designate a preferred default launch city.
   - Metric (Celsius, km/h, mm, hPa) & Imperial (Fahrenheit, mph, in, inHg) conversion standard.
   - Obsidian Dark Mode (default) and Light theme.

---

## 🛠️ Architecture & Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Partial Prefetching, Cache Components)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Mapping**: [Leaflet](https://leafletjs.com/) with Carto Voyager tiles
- **Provider API**: [OpenWeatherMap API](https://openweathermap.org/) (Free Tier 2.5 compatible)
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

```
src/
├── app/
│   ├── api/
│   │   ├── weather/route.ts      # GET /api/weather?lat=..&lon=..
│   │   ├── forecast/route.ts     # GET /api/forecast?lat=..&lon=..
│   │   ├── geocoding/route.ts    # GET /api/geocoding?q=..&limit=..
│   │   └── air-quality/route.ts  # GET /api/air-quality?lat=..&lon=..
│   ├── globals.css               # Design tokens, themes & animations
│   ├── layout.tsx                # Root layout with metadata & providers
│   └── page.tsx                  # Primary Atmos dashboard shell
├── components/
│   ├── layout/                   # Header, Sidebar, MobileNav
│   ├── weather/                  # WeatherHero, WeatherMetrics, HourlyForecast,
│   │                             # DailyForecast, WeatherInsights, ActivityAdvice,
│   │                             # AirQuality, WeatherMap, WeatherAlerts, SavedLocations
│   ├── charts/                   # TemperatureChart, PrecipitationChart
│   ├── settings/                 # SettingsPanel
│   └── ui/                       # Card, Badge, Skeleton, ErrorDisplay
├── context/
│   ├── WeatherContext.tsx        # Central weather state & telemetry actions
│   └── ThemeContext.tsx          # Dark/Light theme manager
├── hooks/
│   ├── useWeather.ts             # API route consumer with abort controllers
│   ├── useGeocoding.ts           # Debounced search hook
│   ├── useGeolocation.ts         # Browser navigator.geolocation handler
│   ├── useFavorites.ts           # Pinned locations with localStorage
│   └── useLocalStorage.ts        # SSR-safe reactive localStorage hook
├── lib/
│   ├── weather/
│   │   ├── provider.ts           # Outbound HTTP fetcher with timeout & credentials
│   │   ├── openweather.ts        # Modular OpenWeather implementation
│   │   ├── normalize.ts          # Normalization layer mapping raw API to domain
│   │   ├── cache.ts              # In-memory TTL cache
│   │   └── types.ts              # Raw provider API response typings
│   ├── formatting.ts             # Strict unit conversion & date/time formatters
│   └── validation.ts             # Coordinate bounds & query sanitization
└── types/
    └── weather.ts                # Application domain TypeScript models
```

---

## 🔒 Security & API Integration

- **Server-Side API Key Protection**: All provider calls originate strictly inside Next.js Route Handlers. The `OPENWEATHER_API_KEY` is **never** exposed to client-side bundles or HTTP responses.
- **Input Validation**: Rigorous validation on latitude (`[-90, 90]`), longitude (`[-180, 180]`), and query length, stripping malicious XSS vectors.
- **Intelligent In-Memory Caching**:
  - Current Weather: 5 minutes TTL
  - Forecast: 15 minutes TTL
  - Geocoding Searches: 24 hours TTL
  - Air Quality: 10 minutes TTL
- **Graceful Error Handling**: Typed sentinel errors (`ApiKeyMissingError`, `ProviderError`, `TimeoutError`) returning standardized JSON schemas with appropriate HTTP status codes (400, 429, 502, 503, 504).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18.17+` or `v20+` (tested up to Node `v24`)
- npm `v9+` or `v10+`

### 2. Installation
```bash
git clone <repo-url>
cd magical-bell
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:
```env
# OpenWeather API Key (Get a free key from https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_actual_api_key_here
```

> **Note**: If `OPENWEATHER_API_KEY` is omitted, the application runs in development fallback mode with descriptive configuration alerts without crashing.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite:
```bash
# Run unit & integration test suites
npm test

# Run tests in verbose mode
npm test -- --verbose

# Run TypeScript static type check
npm run type-check

# Run production build
npm run build
```

### Test Coverage Summary:
- **`formatting.test.ts`**: Temperature, wind speed, pressure, visibility, and precipitation math conversions.
- **`validation.test.ts`**: Coordinate bounds, string truncation, and XSS sanitization.
- **`normalize.test.ts`**: Transformation of raw OpenWeather data to domain models.
- **`api.test.ts`**: Server-side route handlers, parameter validation, and 503/400 error handling.

---

## 🚢 Production Deployment

### Vercel Deployment
1. Import the repository into your [Vercel](https://vercel.com) dashboard.
2. In the **Environment Variables** section, add:
   - `OPENWEATHER_API_KEY`: `your_openweather_api_key`
3. Click **Deploy**. Next.js will automatically build and serve the optimized static and server-rendered routes.

### Self-Hosted / Docker
```bash
npm run build
npm start
```
By default, the server listens on port `3000`.

---

## 📄 License & Attribution

- Weather observation telemetry powered by [OpenWeather](https://openweathermap.org/).
- Cartography and GIS base tiles courtesy of [OpenStreetMap](https://www.openstreetmap.org/) contributors and [CartoDB](https://carto.com/).
- Built for the Atmos Weather Intelligence Platform.
