import { render, screen } from "@testing-library/react";
import WorkSection from "./WorkSection";

test("shows the three teaser cards and links to /work", () => {
  render(<WorkSection />);
  expect(screen.getByRole("heading", { name: /utravel\.com/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /thrillark/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /mariprasad\.com/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /more work/i })).toHaveAttribute("href", "/work");
});
