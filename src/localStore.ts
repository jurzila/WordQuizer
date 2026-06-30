import AsyncStorage from "@react-native-async-storage/async-storage";
import { Collection, Word } from "./types";

const STORAGE_KEY_WORDS = "words";
const STORAGE_KEY_COLLECTIONS = "collections";

export const storeWords = async (value: Word[]) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(STORAGE_KEY_WORDS, jsonValue);
  } catch (e) {
    console.error(e);
  }
};

export const getWords = async (): Promise<Word[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_WORDS);
    return jsonValue != null ? (JSON.parse(jsonValue) as Word[]) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const storeCollections = async (value: Collection[]) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(STORAGE_KEY_COLLECTIONS, jsonValue);
  } catch (e) {
    console.error(e);
  }
};

export const getCollections = async (): Promise<Collection[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_COLLECTIONS);
    return jsonValue != null ? (JSON.parse(jsonValue) as Collection[]) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};
