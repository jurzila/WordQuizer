import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import WordListScreen from './src/screens/WordListScreen';
import AddWordScreen from './src/screens/AddWordScreen';
import QuizScreen from './src/screens/QuizScreen';
import { Word } from './src/types';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

let staringWords: Word[] = []

const storeData = async (value: Word[]) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('words', jsonValue)
  } catch (e) {
    console.log(e)
  }
}

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('words')
    return jsonValue != null ? JSON.parse(jsonValue) : [] 
  } catch (e) {
    console.log(e)
  }
}

export default function App() {
  const [words, setWords] = useState<Word[]>(staringWords)
  const hasLoaded = useRef(false)

  const handleAdd = (word: Word) => {
    setWords((prev) => [...prev, word])
  }

  const handleDelete = (id: string) => {
    setWords((prev) => prev.filter((word) => word.id !== id))
  }

  useEffect(() => {
    getData().then((result) => {
      setWords(result)
    })
    hasLoaded.current = true
  }, [])

  useEffect(() => {
    if (!hasLoaded.current) {
      return
    }
    storeData(staringWords)
  }, [staringWords])

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Words">
          {() => <WordListScreen words={words} onDelete={handleDelete} />}
          </Tab.Screen> 
        <Tab.Screen name="Add Word">
          {() => <AddWordScreen onAdd={handleAdd} />}
        </Tab.Screen>
        <Tab.Screen name="Quiz" >
          {() => <QuizScreen words={words} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
