import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Word } from "../types";
import { useEffect, useReducer } from "react";
import { useWordApp } from "../context/WordAppContext";
import { QuizStackParamList } from "../navigation/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { QuizCard } from "../components/QuizCard";
import { sharedStyles } from "../theme/sharedStyles";
import { initialState, quizReducer } from "../reducers/quizReducer";

export default function QuizScreen() {
  const route = useRoute<RouteProp<QuizStackParamList, "QuizScreen">>();
  const { collectionIds } = route.params;
  const { words } = useWordApp();
  const availableWords = words.filter((word) =>
    collectionIds.includes(word.collectionId),
  );
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const {
    wordPool,
    quizWords,
    translations,
    selectedWord,
    matched,
    wrong,
    isAnimating,
  } = state;

  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = () => {
    dispatch({ type: "START_QUIZ", payload: availableWords });
  };

  const handleWordPress = (item: Word) => {
    if (matched.includes(item._id)) return;
    dispatch({ type: "SELECT_WORD", payload: item });
  };

  const handleTranslationPress = (item: Word) => {
    if (matched.includes(item._id)) return;
    if (!selectedWord) return;

    if (selectedWord._id === item._id) {
      dispatch({ type: "CORRECT_MATCH", payload: item });

      setTimeout(() => {
        dispatch({ type: "RESHUFFLE" });
      }, 300);
    } else {
      if (isAnimating) return;
      dispatch({ type: "WRONG_MATCH", payload: item });
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
  const total = quizWords.length + wordPool.length + matched.length;
  const completed = matched.length;

  return (
    <View style={sharedStyles.container}>
      {isFinished ? (
        <View style={styles.result}>
          <Text style={styles.resultText}>All matched!</Text>
          <TouchableOpacity
            style={sharedStyles.primaryButton}
            onPress={startQuiz}
          >
            <Text style={sharedStyles.primaryButtonText}>Play again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[sharedStyles.title, styles.title]}>
            Match the pairs
          </Text>
          <View style={styles.progress}>
            <Text style={styles.progressText}>
              {completed} / {total}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${total > 0 ? (completed / total) * 100 : 0}%` },
                ]}
              />
            </View>
          </View>
          <View style={styles.columns}>
            <View style={styles.column}>
              {quizWords.map((item) => {
                const isMatched = matched.includes(item._id);
                const isSelected = selectedWord?._id === item._id;
                return (
                  <QuizCard
                    key={item._id}
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
                const isMatched = matched.includes(item._id);
                const isWrong = wrong === item._id;
                return (
                  <QuizCard
                    key={item._id}
                    text={item.translation}
                    onPress={() => handleTranslationPress(item)}
                    disabled={isMatched || isAnimating}
                    isMatched={isMatched}
                    isSelected={false}
                    isWrong={isWrong}
                    onWrongAnimationComplete={() => {
                      dispatch({ type: "WRONG_ANIMATION_COMPLETE" });
                    }}
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

  progress: {
    marginBottom: 24,
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    color: "#888780",
    textAlign: "right",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e6e4da",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2f6b3a",
    borderRadius: 99,
  },
});
