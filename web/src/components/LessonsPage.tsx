import { Link } from "@tanstack/react-router";
import type { Collection } from "../types";
import { useState } from "react";
import Button from "./ui/Button";
import TextButton from "./ui/TextButton";
import TextField from "./ui/TextField";
import ErrorMessage from "./ui/ErrorMessage";
import Page from "./ui/Page";
import PageHeader from "./ui/PageHeader";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import FormActions from "./ui/FormActions";

type LessonsPageProps = {
  collections: Collection[];
  onCreate: (name: string) => Promise<unknown>;
  onRename: (name: string, collectionId: string) => Promise<unknown>;
  onDelete: (collectionId: string) => Promise<unknown>;
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
        <Card tone="danger">
          <p className="text-base font-semibold text-text-primary">
            Delete “{item.name}”?
          </p>
          <p className="text-md text-text-secondary mt-1">
            Its words will be deleted too. This cannot be undone.
          </p>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormActions>
            <Button
              variant="secondary"
              onClick={cancelRowMode}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => confirmDelete(item._id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting…" : "Delete"}
            </Button>
          </FormActions>
        </Card>
      );
    }

    if (mode === "rename") {
      return (
        <Card>
          <form
            onSubmit={(e) => submitRename(e, item._id)}
            className="flex flex-row items-center gap-2"
          >
            <TextField
              id={`rename-${item._id}`}
              label="Lesson name"
              labelHidden
              className="flex-1 min-w-0"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              autoFocus
            />
            <TextButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </TextButton>
            <TextButton
              tone="muted"
              onClick={cancelRowMode}
              disabled={isSubmitting}
            >
              Cancel
            </TextButton>
          </form>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Card>
      );
    }

    return (
      <Card>
        <div className="flex flex-row items-center justify-between gap-2">
          <Link
            to="/lessons/$collectionId"
            params={{ collectionId: item._id }}
            className="flex-1 min-w-0 text-base font-semibold text-text-primary truncate"
          >
            {item.name}
          </Link>
          <TextButton tone="muted" onClick={() => startRename(item)}>
            Rename
          </TextButton>
          <TextButton tone="danger" onClick={() => startDelete(item._id)}>
            Delete
          </TextButton>
        </div>
      </Card>
    );
  };

  return (
    <Page>
      <PageHeader
        title="Lessons"
        action={
          !isCreating && (
            <Button onClick={() => setIsCreating(true)}>+ New lesson</Button>
          )
        }
      />

      {isCreating && (
        <Card className="mb-4">
          <form onSubmit={submitCreate}>
            <TextField
              id="lesson-name"
              label="Lesson name"
              className="w-full"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Greetings"
              required
              autoFocus
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FormActions>
              <Button
                variant="secondary"
                onClick={() => {
                  setName("");
                  setError(null);
                  setIsCreating(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </FormActions>
          </form>
        </Card>
      )}

      {collections.length === 0 && !isCreating ? (
        <EmptyState
          title="No lessons yet."
          message="Create one to start adding words."
        />
      ) : (
        <ul className="flex flex-col gap-2.5 pb-6">
          {collections.map((item) => (
            <li key={item._id}>{renderRow(item)}</li>
          ))}
        </ul>
      )}
    </Page>
  );
}
