import { render, screen } from "@testing-library/react";
import Hero from "./Hero";

test("shows name and tagline", () => {
  render(<Hero />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mariprasad");
  expect(screen.getByText(/still chasing pace, still waiting on dough/i)).toBeInTheDocument();
});
