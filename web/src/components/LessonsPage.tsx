import { Link } from "@tanstack/react-router";
import type { Collection } from "../types";
import { useState } from "react";

type LessonsPageProps = {
  collections: Collection[];
  onCreate: (name: string) => Promise<void>;
  onRename: (name: string, collectionId: string) => Promise<void>;
  onDelete: (collectionId: string) => Promise<void>;
};

type RowMode = { id: string; mode: "rename" | "confirmDelete" } | null;

export default function LessonsPage({
  collections,
  onCreate,
  onRename,
  onDelete,
}: LessonsPageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editName, setEditName] = useState("");
  const [rowMode, setRowMode] = useState<RowMode>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startRename = (item: Collection) => {
    setRowMode({ id: item._id, mode: "rename" });
    setEditName(item.name);
    setError(null);
  };

  const startDelete = (collectionId: string) => {
    setRowMode({ id: collectionId, mode: "confirmDelete" });
    setError(null);
  };

  const cancelRowMode = () => {
    setRowMode(null);
    setError(null);
  };

  const submitCreate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onCreate(name);
      setName("");
      setIsCreating(false);
    } catch {
      setError("Could not create the lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRename = async (
    e: React.SubmitEvent<HTMLFormElement>,
    collectionId: string,
  ) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onRename(editName, collectionId);
      setEditName("");
      setRowMode(null);
    } catch {
      setError("Could not rename the lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (collectionId: string) => {
    try {
      setIsSubmitting(true);
      await onDelete(collectionId);
      setRowMode(null);
    } catch {
      setError("Could not delete the lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRow = (item: Collection) => {
    const mode = rowMode?.id === item._id ? rowMode.mode : null;

    if (mode === "confirmDelete") {
      return (
        <div className="bg-danger-bg rounded-xl py-3.5 px-4 border border-danger-border">
          <p className="text-base font-semibold text-text-primary">
            Delete “{item.name}”?
          </p>
          <p className="text-md text-text-secondary mt-1">
            Its words will be deleted too. This cannot be undone.
          </p>

          {error && <p className="text-sm text-danger mt-2">{error}</p>}

          <div className="flex flex-row justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={cancelRowMode}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-md border border-borderInput text-md font-medium text-text-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmDelete(item._id)}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-md bg-danger text-surface text-md font-semibold disabled:opacity-50"
            >
              {isSubmitting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      );
    }

    if (mode === "rename") {
      return (
        <div className="bg-surface rounded-xl py-3.5 px-4 border border-border">
          <form
            onSubmit={(e) => submitRename(e, item._id)}
            className="flex flex-row items-center gap-2"
          >
            <label htmlFor={`rename-${item._id}`} className="sr-only">
              Lesson name
            </label>
            <input
              id={`rename-${item._id}`}
              className="flex-1 min-w-0 border border-borderInput rounded-md py-2.5 px-3 text-base bg-surface focus:border-primary focus:outline-none"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-1 px-1.5 text-sm font-semibold text-primary disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelRowMode}
              disabled={isSubmitting}
              className="py-1 px-1.5 text-sm font-medium text-text-muted disabled:opacity-50"
            >
              Cancel
            </button>
          </form>

          {error && <p className="text-sm text-danger mt-2">{error}</p>}
        </div>
      );
    }

    return (
      <div className="bg-surface rounded-xl py-3.5 px-4 border border-border">
        <div className="flex flex-row items-center justify-between gap-2">
          <Link
            to="/lessons/$collectionId"
            params={{ collectionId: item._id }}
            className="flex-1 min-w-0 text-base font-semibold text-text-primary truncate"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => startRename(item)}
            className="py-1 px-1.5 text-sm font-medium text-text-muted"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => startDelete(item._id)}
            className="py-1 px-1.5 text-sm font-medium text-danger"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto w-full max-w-screen-sm">
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-text-primary">Lessons</h1>
          {!isCreating && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="py-2.5 px-4 rounded-md bg-primary text-surface text-md font-semibold"
            >
              + New lesson
            </button>
          )}
        </div>

        {isCreating && (
          <div className="bg-surface rounded-xl p-4 mb-4 border border-border">
            <form onSubmit={submitCreate}>
              <label
                className="block text-sm font-medium text-text-secondary mb-1.5"
                htmlFor="name"
              >
                Lesson name
              </label>
              <input
                id="name"
                className="w-full border border-borderInput rounded-md py-2.5 px-3 text-base bg-surface focus:border-primary focus:outline-none"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Greetings"
                required
                autoFocus
              />

              {error && <p className="text-sm text-danger mt-2">{error}</p>}

              <div className="flex flex-row justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setError(null);
                    setIsCreating(false);
                  }}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-md border border-borderInput text-md font-medium text-text-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-md bg-primary text-surface text-md font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {collections.length === 0 && !isCreating ? (
          <div className="flex flex-col items-center py-10">
            <p className="text-base font-semibold text-text-primary mb-1">
              No lessons yet.
            </p>
            <p className="text-md text-text-muted">
              Create one to start adding words.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5 pb-6">
            {collections.map((item) => (
              <li key={item._id}>{renderRow(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
