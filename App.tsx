import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import WordListScreen from './src/screens/WordListScreen';
import AddWordScreen from './src/screens/AddWordScreen';
import QuizScreen from './src/screens/QuizScreen';
import { Word } from './src/types';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getData, storeData } from './src/wordStore';

const Tab = createBottomTabNavigator();

export default function App() {
  const [words, setWords] = useState<Word[]>([])
  const hasLoaded = useRef(false)

  const handleAdd = (word: Word) => {
    setWords((prev) => [...prev, word])
  }

  const handleDelete = (id: string) => {
    setWords((prev) => prev.filter((word) => word.id !== id))
  }

  useEffect(() => {
    getData().then((result) => {
      setWords(result ?? [])
      hasLoaded.current = true
    })
    
  }, [])

  useEffect(() => {
    if (!hasLoaded.current) {
      return
    }
    storeData(words)
  }, [words])

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
