import { readStored, TOKEN_KEY } from "./storage";
import type { AuthResponse, Collection, Word } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${readStored(TOKEN_KEY)}`,
});

export const getCollections = async (): Promise<Collection[]> => {
  const response = await fetch(`${BASE_URL}/collection`, {
    method: "GET",
    headers: authHeaders(),
  });
  return await handleResponse<Collection[]>(
    response,
    "Failed to fetch collections",
  );
};

export const getCollection = async (
  collectionId: string,
): Promise<Collection> => {
  const response = await fetch(`${BASE_URL}/collection/${collectionId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return await handleResponse<Collection>(
    response,
    "Failed to fetch collection",
  );
};

export const createCollection = async (name: string): Promise<Collection> => {
  const response = await fetch(`${BASE_URL}/collection`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  return await handleResponse<Collection>(
    response,
    "Failed to create a collection",
  );
};

export const renameCollection = async (
  name: string,
  collectionId: string,
): Promise<Collection> => {
  const response = await fetch(`${BASE_URL}/collection/${collectionId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  return await handleResponse<Collection>(
    response,
    "Failed to update a collection",
  );
};

export const deleteCollection = async (collectionId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/collection/${collectionId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await throwIfFailed(response, "Failed to delete a collection");
};

export const getWords = async (): Promise<Word[]> => {
  const response = await fetch(`${BASE_URL}/word`, {
    method: "GET",
    headers: authHeaders(),
  });
  return await handleResponse<Word[]>(response, "Failed to fetch words");
};

export const createWord = async (
  word: string,
  translation: string,
  collectionId: string,
): Promise<Word> => {
  const response = await fetch(`${BASE_URL}/word`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ word, translation, collectionId }),
  });
  return await handleResponse<Word>(response, "Failed to create a word");
};

export const getWordsByCollection = async (
  collectionId: string,
): Promise<Word[]> => {
  const response = await fetch(`${BASE_URL}/word/collection/${collectionId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return await handleResponse<Word[]>(
    response,
    "Failed to get words by for collection",
  );
};

export const deleteWord = async (wordId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/word/${wordId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await throwIfFailed(response, "Failed to delete a word");
};

export const getQuizWords = async (
  collectionIds: string[],
): Promise<Word[]> => {
  const params = new URLSearchParams();
  collectionIds.forEach((id) => params.append("collectionIds", id));
  const response = await fetch(`${BASE_URL}/word/quiz?${params}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return await handleResponse<Word[]>(
    response,
    "Failed to get words by for collection",
  );
};

export const register = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await handleResponse<AuthResponse>(
    response,
    "Failed to register user",
  );
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await handleResponse<AuthResponse>(response, "Failed to login");
};

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const handleResponse = async <T>(
  response: Response,
  message: string,
): Promise<T> => {
  await throwIfFailed(response, message);
  return response.json();
};

const throwIfFailed = async (
  response: Response,
  message: string,
): Promise<void> => {
  if (!response.ok) {
    let errorMessage = message;
    try {
      const body: unknown = await response.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string"
      ) {
        errorMessage = body.message;
      }
    } catch {
      // if there is a error while deserializing json fall to passed in message
    }
    throw new ApiError(response.status, errorMessage);
  }
};
