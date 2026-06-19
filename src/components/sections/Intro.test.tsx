import { render, screen } from "@testing-library/react";
import Intro from "./Intro";

test("renders intro copy and an ask prompt", () => {
  render(<Intro />);
  expect(screen.getByText(/talk to me/i)).toBeInTheDocument();
});
