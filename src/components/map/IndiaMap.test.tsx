import { render } from "@testing-library/react";
import IndiaMap from "./IndiaMap";
import { VISITED } from "@/data/travel";

test("renders state paths and marks exactly the visited ones", () => {
  const { container } = render(<IndiaMap />);
  const all = container.querySelectorAll("path");
  expect(all.length).toBe(36); // exactly the 36 states/UTs — pins the `states` object, not `districts` (723)
  const visited = container.querySelectorAll('[data-visited="true"]');
  expect(visited.length).toBe(VISITED.length); // 20
});
