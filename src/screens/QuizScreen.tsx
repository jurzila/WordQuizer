import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Word } from "../types";
import { useEffect, useState } from "react";
import { useWordApp } from "../context/WordAppContext";
import { QuizStackParamList } from "../navigation/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { QuizCard } from "../components/QuizCard";
import { sharedStyles } from "../theme/sharedStyles";

type NavProp = NativeStackNavigationProp<QuizStackParamList, "QuizScreen">;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[randomIndex];
    result[randomIndex] = temp;
  }
  return result;
}

export default function QuizScreen() {
  const route = useRoute<RouteProp<QuizStackParamList, "QuizScreen">>();
  const { collectionIds } = route.params;
  const { words } = useWordApp();
  const availableWords = words.filter((word) =>
    collectionIds.includes(word.collectionId),
  );
  const [wordPool, setWordPool] = useState<Word[]>([]);
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [translations, setTranslations] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);

  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = () => {
    const shuffled = shuffle(availableWords);
    setWordPool(shuffled.slice(5));
    const picked = shuffled.slice(0, 5);
    setQuizWords(picked);
    setTranslations(shuffle(picked));
    setSelectedWord(null);
    setMatched([]);
    setWrong(null);
  };

  const handleWordPress = (item: Word) => {
    if (matched.includes(item.id)) return;
    setSelectedWord(item);
  };

  const handleTranslationPress = (item: Word) => {
    if (matched.includes(item.id)) return;
    if (!selectedWord) return;

    if (selectedWord.id === item.id) {
      setMatched((prev) => [...prev, item.id]);
      let updatedQuizWords = quizWords.filter(
        (word) => word.id !== selectedWord.id,
      );
      if (wordPool.length > 0) {
        updatedQuizWords = [...updatedQuizWords, wordPool[0]];
        setWordPool(wordPool.slice(1));
      }
      setQuizWords(updatedQuizWords);
      setTranslations(shuffle(updatedQuizWords));

      setSelectedWord(null);
      setWrong(null);
    } else {
      setWrong(item.id);
      setTimeout(() => {
        setWrong(null);
        setSelectedWord(null);
      }, 800);
    }
  };

  if (availableWords.length < 5) {
    return (
      <View style={sharedStyles.container}>
        <Text>Add at least 5 words to start a quiz!</Text>
      </View>
    );
  }

  const isFinished = quizWords.length === 0 && wordPool.length === 0;

  return (
    <View style={sharedStyles.container}>
      {isFinished ? (
        <View style={styles.result}>
          <Text style={styles.resultText}>All matched!</Text>
          <TouchableOpacity style={sharedStyles.primaryButton} onPress={startQuiz}>
            <Text style={sharedStyles.primaryButtonText}>Play again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[sharedStyles.title, styles.title]}>Match the pairs</Text>
          <View style={styles.columns}>
            <View style={styles.column}>
              {quizWords.map((item) => {
                const isMatched = matched.includes(item.id);
                const isSelected = selectedWord?.id === item.id;
                return (
                  <QuizCard
                    key={item.id}
                    text={item.word}
                    onPress={() => handleWordPress(item)}
                    disabled={isMatched}
                    isMatched={isMatched}
                    isSelected={isSelected}
                    isWrong={false}
                  />
                );
              })}
            </View>

            <View style={styles.column}>
              {translations.map((item) => {
                const isMatched = matched.includes(item.id);
                const isWrong = wrong === item.id;
                return (
                  <QuizCard
                    key={item.id}
                    text={item.translation}
                    onPress={() => handleTranslationPress(item)}
                    disabled={isMatched}
                    isMatched={isMatched}
                    isSelected={false}
                    isWrong={isWrong}
                  />
                );
              })}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: "row", justifyContent: "space-between" },
  column: { flex: 1, gap: 12, marginHorizontal: 4 },
  result: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  resultText: { fontSize: 28, fontWeight: "bold" },
  title: { marginBottom: 16 },
});