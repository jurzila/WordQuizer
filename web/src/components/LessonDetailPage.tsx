import type { Collection, Word } from "../types";

export default function LessonDetailPage({
  collection,
  words,
}: {
  collection: Collection;
  words: Word[];
}) {
  const wordsList = words.map((item) => (
    <li key={item._id}>
      <div className="bg-surface rounded-xl py-3.5 px-4 border border-border">
        <div className="flex flex-row items-center  justify-between p-2">
          <p className="text-base font-bold">{item.word}</p>
          <p className="text-base text-text-secondary">{item.translation}</p>
        </div>
      </div>
    </li>
  ));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center-safe p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <h1 className="text-2xl text-primary">{collection.name}</h1>
      </div>
      {words.length === 0 ? (
        <div className="flex flex-row justify-between items-center mb-4">
          <p className="text-base text-primary mb-1">No words in lesson yet</p>
          <p className="text-md text-text-muted">Add words.</p>
        </div>
      ) : (
        <ul>{wordsList}</ul>
      )}
    </div>
  );
}
