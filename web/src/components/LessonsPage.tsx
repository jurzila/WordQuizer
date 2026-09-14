import { Link } from "@tanstack/react-router";
import type { Collection } from "../types";

export default function LessonsPage({
  collections,
}: {
  collections: Collection[];
}) {
  const lessonsList = collections.map((item) => (
    <li key={item._id}>
      <div className="bg-surface rounded-xl py-3.5 px-4 border border-border">
        <div className="flex flex-row items-center  justify-between p-2">
          <Link to="/lessons/$collectionId" params={{ collectionId: item._id }}>
            {item.name}
          </Link>
        </div>
      </div>
    </li>
  ));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center-safe p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <h1 className="text-2xl text-primary">Lessons</h1>
      </div>
      {collections.length === 0 ? (
        <div className="flex items-center p-10">
          <p className="text-base text-primary mb-1">No lessons yet.</p>
          <p className="text-md text-text-muted">
            Create one to start adding words.
          </p>
        </div>
      ) : (
        <ul>{lessonsList}</ul>
      )}
    </div>
  );
}
