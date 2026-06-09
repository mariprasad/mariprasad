import { render } from "@testing-library/react";
import IndiaMap from "./IndiaMap";
import { VISITED } from "@/data/travel";

test("renders state paths and marks exactly the visited ones", () => {
  const { container } = render(<IndiaMap />);
  const all = container.querySelectorAll("path");
  expect(all.length).toBeGreaterThan(20); // full country outline
  const visited = container.querySelectorAll('[data-visited="true"]');
  expect(visited.length).toBe(VISITED.length); // 20
});
