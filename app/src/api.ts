import { Collection, Word } from "./types";

const BASE_URL = "http://192.168.0.110:3000/api";

export const getCollections = async (): Promise<Collection[]> => {
  const response = await fetch(`${BASE_URL}/collection`);
  if (!response.ok) throw new Error("Failed to fetch collections");
  return response.json();
};

export const createCollection = async (name: string): Promise<Collection> => {
  const response = await fetch(`${BASE_URL}/collection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to create a collection");
  return response.json();
};

export const renameCollection = async (
  name: string,
  collectionId: string,
): Promise<Collection> => {
  const response = await fetch(`${BASE_URL}/collection/${collectionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to update a collection");
  return response.json();
};

export const deleteCollection = async (collectionId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/collection/${collectionId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete a collection");
};

export const getWords = async (): Promise<Word[]> => {
  const response = await fetch(`${BASE_URL}/word`);
  if (!response.ok) throw new Error("Failed to fetch words");
  return response.json();
};

export const createWord = async (
  word: string,
  translation: string,
  collectionId: string,
): Promise<Word> => {
  const response = await fetch(`${BASE_URL}/word`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, translation, collectionId }),
  });
  if (!response.ok) throw new Error("Failed to create a word");
  return response.json();
};

export const getWordsByCollection = async (
  collectionId: string,
): Promise<Word[]> => {
  const response = await fetch(`${BASE_URL}/word/collection/${collectionId}`);
  if (!response.ok) throw new Error("Failed to get words by for collection");
  return response.json();
};

export const deleteWord = async (wordId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/word/${wordId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete a word");
};

export const getQuizWords = async (
  collectionIds: string[],
): Promise<Word[]> => {
  const params = new URLSearchParams();
  collectionIds.forEach((id) => params.append("collectionIds", id));
  const response = await fetch(`${BASE_URL}/word/quiz?${params}`);
  if (!response.ok) throw new Error("Failed to get words by for collection");
  return response.json();
};
