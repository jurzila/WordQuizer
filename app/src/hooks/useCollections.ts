import { useEffect, useState } from "react";
import { Collection } from "../types";
import {
  createCollection,
  deleteCollection,
  getCollections,
  renameCollection,
} from "../api";

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  const handleAddCollection = async (name: string) => {
    const newCollection = await createCollection(name);
    setCollections((prev) => [...prev, newCollection]);
  };

  const handleDeleteCollection = async (id: string) => {
    await deleteCollection(id);
    setCollections((prev) =>
      prev.filter((collection) => collection._id !== id),
    );
  };

  const handleRenameCollection = async (id: string, name: string) => {
    const updatedCollection = await renameCollection(name, id);
    const renamed = collections.map((collection) => {
      if (collection._id === id) {
        return updatedCollection;
      }
      return collection;
    });
    setCollections(renamed);
  };

  return {
    handleAddCollection,
    handleDeleteCollection,
    handleRenameCollection,
    collections,
  };
}
