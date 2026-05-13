import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import WordListScreen from './src/screens/WordListScreen';
import AddWordScreen from './src/screens/AddWordScreen';
import QuizScreen from './src/screens/QuizScreen';
import { Word } from './src/types';
import { useState } from 'react';

const Tab = createBottomTabNavigator();

const mockWords: Word[] = [
    {id: "1", word: "hva", translation: "what" },
    {id: "2", word: "gjør", translation: "do" },
    {id: "3", word: "du", translation: "you" },
    {id: "4", word: "jeg", translation: "I" },
    {id: "5", word: "lager", translation: "make" },
    {id: "6", word: "en gave", translation: "a present" },
]



export default function App() {
  const [words, setWords] = useState<Word[]>(mockWords)

  const handleAdd = (word: Word) => {
    setWords((prev) => [...prev, word])
  }

  const handleDelete = (id: string) => {
    setWords((prev) => prev.filter((word) => word.id !== id))
  }
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
