import { render, screen } from "@testing-library/react";
import NowWatchingSection from "./NowWatchingSection";

test("renders heading and links to /movies", () => {
  render(<NowWatchingSection films={[]} />);
  expect(screen.getByText(/now watching/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /watchlist|movies/i })).toHaveAttribute("href", "/movies");
});
