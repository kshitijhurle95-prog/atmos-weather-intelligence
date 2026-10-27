require('@testing-library/jest-dom');

// Polyfill Node 18+ Web APIs into Jest JSDOM window
if (typeof global.Request === 'undefined') {
  // @ts-ignore
  global.Request = globalThis.Request;
  // @ts-ignore
  global.Response = globalThis.Response;
  // @ts-ignore
  global.Headers = globalThis.Headers;
  // @ts-ignore
  global.fetch = globalThis.fetch;
}
