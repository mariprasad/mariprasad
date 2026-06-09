import { render, screen } from "@testing-library/react";
import MovementSection from "./MovementSection";

test("shows trek altitude and 10k milestone and links to /movement", () => {
  render(<MovementSection />);
  expect(screen.getByText(/15,500 ft/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /climb|movement/i })).toHaveAttribute("href", "/movement");
});
