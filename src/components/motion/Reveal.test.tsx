import { render, screen } from "@testing-library/react";
import Reveal from "./Reveal";

test("renders its children", () => {
  render(<Reveal><p>hello dough</p></Reveal>);
  expect(screen.getByText("hello dough")).toBeInTheDocument();
});
