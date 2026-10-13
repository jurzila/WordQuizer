import { describe, expect, it, vi } from "vitest";
import type { Collection } from "../../types";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import LessonsPage from "../LessonsPage";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const collections: Collection[] = [
  { _id: "c1", name: "Greetings" },
  { _id: "c2", name: "Food" },
];

function renderPage(collectionsProp: Collection[] = collections) {
  const onCreate = vi.fn(async (_name: string) => {});
  const onRename = vi.fn(async (_name: string, _collectionId: string) => {});
  const onDelete = vi.fn(async (_collectionId: string) => {});

  const rootRoute = createRootRoute({
    component: () => (
      <LessonsPage
        collections={collectionsProp}
        onCreate={onCreate}
        onRename={onRename}
        onDelete={onDelete}
      />
    ),
  });

  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  render(<RouterProvider router={router} />);

  return { onCreate, onRename, onDelete, user: userEvent.setup() };
}

describe("LessonsPage", () => {
  it("clicking Rename shows an input seeded with that lesson’s name", async () => {
    const user = renderPage(collections).user;

    const foodRow = (await screen.findByRole("link", { name: "Food" })).closest(
      "li",
    )!;
    await user.click(within(foodRow).getByRole("button", { name: "Rename" }));

    expect(within(foodRow).getByLabelText("Lesson name")).toHaveValue("Food");
  });

  it("renaming and clicking Save triggers onRename", async () => {
    const { onRename, user } = renderPage();
    const foodRow = (await screen.findByRole("link", { name: "Food" })).closest(
      "li",
    )!;
    await user.click(within(foodRow).getByRole("button", { name: "Rename" }));
    await user.clear(
      within(foodRow).getByRole("textbox", { name: "Lesson name" }),
    );
    await user.type(
      within(foodRow).getByRole("textbox", { name: "Lesson name" }),
      "Clothes",
    );
    await user.click(within(foodRow).getByRole("button", { name: "Save" }));

    expect(onRename).toHaveBeenCalledExactlyOnceWith("Clothes", "c2");
  });

   it("clicking Delete shows confirmation with lessons name and onDelete is not called", async () => {
    const { onDelete, user } = renderPage();
    const foodRow = (await screen.findByRole("link", { name: "Food" })).closest(
      "li",
    )!;
    await user.click(within(foodRow).getByRole("button", { name: "Delete" }));

    expect(await within(foodRow).findByText(`Delete “Food”?`)).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("clicking Delete and Cancel onDelete is not called", async () => {
    const { onDelete, user } = renderPage();
    const foodRow = (await screen.findByRole("link", { name: "Food" })).closest(
      "li",
    )!;
    await user.click(within(foodRow).getByRole("button", { name: "Delete" }));
    await user.click(within(foodRow).getByRole("button", { name: "Cancel" }));

    expect(within(foodRow).queryByText(`Delete “Food”?`)).not.toBeInTheDocument()
    expect(within(foodRow).getByText("Food")).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
