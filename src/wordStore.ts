import AsyncStorage from "@react-native-async-storage/async-storage"
import { Word } from "./types"

const STORAGE_KEY = 'words'

export const storeData = async (value: Word[]) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue)
  } catch (e) {
    console.error(e)
  }
}

export const getData = async (): Promise<Word[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY)
    return jsonValue != null ? JSON.parse(jsonValue) as Word[] : [] 
  } catch (e) {
    console.error(e)
    return []
  }
}