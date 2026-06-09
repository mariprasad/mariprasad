import { render, screen } from "@testing-library/react";
import BakerySection from "./BakerySection";

test("teases recent bakes and links to /baking", () => {
  render(<BakerySection />);
  expect(screen.getByText(/the bakery/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /all bakes|baking/i })).toHaveAttribute("href", "/baking");
});
