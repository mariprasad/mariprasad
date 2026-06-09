import "@testing-library/jest-dom/vitest";

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
// @ts-expect-error jsdom lacks IntersectionObserver
globalThis.IntersectionObserver = globalThis.IntersectionObserver ?? IO;
