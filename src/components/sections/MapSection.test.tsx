import { render, screen } from "@testing-library/react";
import MapSection from "./MapSection";

test("headlines the 20-region stat and links to /travel", () => {
  render(<MapSection />);
  expect(screen.getByText(/20/).textContent).toMatch(/20/);
  expect(screen.getByRole("link", { name: /map|travel/i })).toHaveAttribute("href", "/travel");
});
