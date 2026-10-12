import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Collection, Word } from "../../types";
import LessonDetailPage from "../LessonDetailPage";

const collection: Collection = { _id: "c1", name: "Greetings" };

const words: Word[] = [
  { _id: "w1", word: "labas", translation: "hello", collectionId: "c1" },
  { _id: "w2", word: "ačiū", translation: "thank you", collectionId: "c1" },
];

describe("LessonDetailPage", () => {
  it("renders each word with its translation", () => {
    render(<LessonDetailPage collection={collection} words={words} />);

    expect(screen.getByText("labas")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("shows the empty state when there are no words", () => {
    render(<LessonDetailPage collection={collection} words={[]} />);

    expect(screen.getByText("No words in lesson yet.")).toBeInTheDocument();
    expect(screen.getByText("Add words.")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("renders the collection name as the heading", () => {
    render(<LessonDetailPage collection={collection} words={words} />);

    expect(
      screen.getByRole("heading", { name: "Greetings" }),
    ).toBeInTheDocument();
  });
});
