import { Collection, Word } from "./types";

const BASE_URL = "http://192.168.0.110:3000/api";
const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});
let token = "";

export const setToken = (newToken: string) => {
  console.log("setting token:", newToken);
  token = newToken;
};

export const getCollections = async (authToken?: string): Promise<Collection[]> => {
  const t = authToken || token
  const response = await fetch(`${BASE_URL}/collection`, {
    method: "GET",
    headers: authHeaders(t),
  });
  if (!response.ok) throw new Error("Failed to fetch collections");
  return response.json();
};

export const createCollection = async (name: string): Promise<Collection> => {
  const response = await fetch(`${BASE_URL}/collection`, {
    method: "POST",
    headers: authHeaders(token),
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
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to update a collection");
  return response.json();
};

export const deleteCollection = async (collectionId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/collection/${collectionId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to delete a collection");
};

export const getWords = async (authToken?: string): Promise<Word[]> => {
  const t = authToken || token
  const response = await fetch(`${BASE_URL}/word`, {
    method: "GET",
    headers: authHeaders(t),
  });
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
    headers: authHeaders(token),
    body: JSON.stringify({ word, translation, collectionId }),
  });
  if (!response.ok) throw new Error("Failed to create a word");
  return response.json();
};

export const getWordsByCollection = async (
  collectionId: string,
): Promise<Word[]> => {
  const response = await fetch(`${BASE_URL}/word/collection/${collectionId}`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to get words by for collection");
  return response.json();
};

export const deleteWord = async (wordId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/word/${wordId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to delete a word");
};

export const getQuizWords = async (
  collectionIds: string[],
): Promise<Word[]> => {
  const params = new URLSearchParams();
  collectionIds.forEach((id) => params.append("collectionIds", id));
  const response = await fetch(`${BASE_URL}/word/quiz?${params}`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error("Failed to get words by for collection");
  return response.json();
};

export const register = async (
  email: string,
  password: string,
): Promise<{ token: string; email: string }> => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Failed to register user");
  const data = await response.json();
  return { token: data.token, email: data.email };
};

export const login = async (
  email: string,
  password: string,
): Promise<{ token: string; email: string }> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Failed to login");
  const data = await response.json();
  return { token: data.token, email: data.email };
};
