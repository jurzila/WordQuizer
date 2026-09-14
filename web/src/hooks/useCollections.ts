import { useEffect, useState } from "react";
import type { Collection } from "../types";
import {
  createCollection,
  deleteCollection,
  getCollections,
  renameCollection,
} from "../api";

export function useCollections(
  token: string | null,
  setLoading: (v: boolean) => void,
  setError: (v: string | null) => void,
) {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (!token) {
      setCollections([]);
      return;
    }
    setLoading(true);
    setError(null);
    getCollections()
      .then(setCollections)
      .catch(() => setError("Failed to load lessons"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAddCollection = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const newCollection = await createCollection(name);
      setCollections((prev) => [...prev, newCollection]);
    } catch {
      setError("Failed to add lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCollection(id);
      setCollections((prev) =>
        prev.filter((collection) => collection._id !== id),
      );
    } catch {
      setError("Failed to delete lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleRenameCollection = async (id: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedCollection = await renameCollection(name, id);
      const renamed = collections.map((collection) => {
        if (collection._id === id) {
          return updatedCollection;
        }
        return collection;
      });
      setCollections(renamed);
    } catch {
      setError("Failed to rename lesson");
    } finally {
      setLoading(false);
    }
  };

  return {
    handleAddCollection,
    handleDeleteCollection,
    handleRenameCollection,
    collections,
  };
}
