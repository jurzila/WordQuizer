import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Collection, Word } from "../types";
import { getCollections, storeCollections } from "../localStore";

export function useCollections(setWords: Dispatch<SetStateAction<Word[]>>) {
  const hasLoadedCollections = useRef(false);

  const [collections, setCollections] = useState<Collection[]>([]);

  const handleAddCollection = (collection: Collection) => {
    setCollections((prev) => [...prev, collection]);
  };

  const handleDeleteCollection = (id: string) => {
    setCollections((prev) => prev.filter((collection) => collection.id !== id));
    setWords((prev) => prev.filter((word) => word.collectionId !== id));
  };

  const handleRenameCollection = (id: string, name: string) => {
    const renamed = collections.map((collection) => {
      if (collection.id === id) {
        return { ...collection, name: name };
      }
      return collection;
    });
    setCollections(renamed);
  };

  useEffect(() => {
    getCollections().then((result) => {
      setCollections(result ?? []);
      hasLoadedCollections.current = true;
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedCollections.current) {
      return;
    }
    storeCollections(collections);
  }, [collections]);

  return {
    handleAddCollection,
    handleDeleteCollection,
    handleRenameCollection,
    collections,
  };
}
