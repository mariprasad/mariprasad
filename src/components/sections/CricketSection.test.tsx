import { render, screen } from "@testing-library/react";
import CricketSection from "./CricketSection";

test("shows bowling identity and heroes", () => {
  render(<CricketSection />);
  expect(screen.getByText(/i bowl/i)).toBeInTheDocument();
  expect(screen.getByText(/Dale Steyn/)).toBeInTheDocument();
});
