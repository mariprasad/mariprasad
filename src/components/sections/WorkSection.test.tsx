import { render, screen } from "@testing-library/react";
import WorkSection from "./WorkSection";

test("features the LLM pipeline and links to /work", () => {
  render(<WorkSection />);
  expect(screen.getByText(/flight-search/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /work/i })).toHaveAttribute("href", "/work");
});
