import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhotoGallery from "./PhotoGallery";

const photos = ["/a.jpg", "/b.jpg"];

test("renders thumbnails and opens lightbox on click", async () => {
  render(<PhotoGallery photos={photos} alt="bake" />);
  const thumbs = screen.getAllByRole("button", { name: /view photo/i });
  expect(thumbs).toHaveLength(2);
  await userEvent.click(thumbs[0]);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("closes lightbox on Escape", async () => {
  render(<PhotoGallery photos={photos} alt="bake" />);
  const thumbs = screen.getAllByRole("button", { name: /view photo/i });
  await userEvent.click(thumbs[0]);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
