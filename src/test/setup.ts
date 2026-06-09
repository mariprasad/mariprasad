import "@testing-library/jest-dom/vitest";

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
globalThis.IntersectionObserver =
  globalThis.IntersectionObserver ?? (IO as unknown as typeof IntersectionObserver);
