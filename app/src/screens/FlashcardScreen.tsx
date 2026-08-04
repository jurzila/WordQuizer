import { RouteProp, useRoute } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { QuizStackParamList } from "../navigation/types";
import { useWordApp } from "../context/WordAppContext";
import { flashcardReducer, initialState } from "../reducers/flashcardsReducer";
import { useEffect, useReducer } from "react";
import { sharedStyles } from "../theme/sharedStyles";

export default function FlashcardScreen() {
  const route = useRoute<RouteProp<QuizStackParamList, "FlashcardScreen">>();
  const { collectionIds, mode, wordLimit } = route.params;
  const { words } = useWordApp();
  const allWords = words.filter((word) =>
    collectionIds.includes(word.collectionId),
  );
  const availableWords =
    wordLimit === "all" ? allWords : allWords.slice(0, wordLimit);

  const [state, dispatch] = useReducer(flashcardReducer, initialState);
  const { deck, flagged, current, isFlipped, known } = state;

  const front = mode === "word" ? current?.word : current?.translation;
  const back = mode === "word" ? current?.translation : current?.word;
  const frontLabel = mode === "word" ? "word" : "translation";
  const backLabel = mode === "word" ? "translation" : "word";

  useEffect(() => {
    startFlashcards();
  }, []);

  const startFlashcards = () => {
    dispatch({ type: "START_FLASHCARDS", payload: availableWords });
  };

  const handleCardFlip = () => {
    dispatch({ type: "FLIP" });
  };

  const handleNextCard = () => {
    dispatch({ type: "GOT_IT" });
  };

  const handleCardFlag = () => {
    dispatch({ type: "FLAG" });
  };

  const handleReviewFlagged = () => {
    dispatch({ type: "REVIEW_FLAGGED" });
  };

  const total = known + flagged.length + deck.length + (current ? 1 : 0);
  const completed = known + flagged.length;

  if (current === null && deck.length === 0) {
    return (
      <View style={sharedStyles.container}>
        <View style={styles.endScreen}>
          <Text style={styles.endTitle}>Round complete</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Got it</Text>
            <Text style={styles.scoreNumber}>{known}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Flagged</Text>
            <Text style={styles.scoreNumber}>{flagged.length}</Text>
          </View>
          {flagged.length > 0 && (
            <TouchableOpacity
              style={[sharedStyles.primaryButton, styles.reviewButton]}
              onPress={handleReviewFlagged}
            >
              <Text style={sharedStyles.primaryButtonText}>
                Review {flagged.length} flagged
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[sharedStyles.secondaryButton, styles.reviewButton]}
            onPress={startFlashcards}
          >
            <Text style={sharedStyles.secondaryButtonText}>Start over</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={sharedStyles.container}>
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

      <View style={styles.cardArea}>
        <TouchableOpacity
          style={[styles.card, isFlipped && styles.cardFlipped]}
          onPress={handleCardFlip}
          activeOpacity={0.9}
        >
          <Text style={styles.cardLabel}>
            {isFlipped ? backLabel : frontLabel}
          </Text>
          <Text style={styles.cardWord}>{isFlipped ? back : front}</Text>
          {!isFlipped && <Text style={styles.cardHint}>tap to reveal</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.flagButton]}
          onPress={handleCardFlag}
        >
          <Text style={styles.flagButtonText}>Flag</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.gotItButton]}
          onPress={handleNextCard}
        >
          <Text style={styles.gotItButtonText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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

  cardArea: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e4da",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
    gap: 12,
  },
  cardFlipped: {
    backgroundColor: "#eef6ef",
    borderColor: "#2f6b3a",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#888780",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardWord: {
    fontSize: 32,
    fontWeight: "600",
    color: "#1a1a18",
    textAlign: "center",
  },
  cardHint: {
    fontSize: 13,
    color: "#888780",
    marginTop: 8,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  flagButton: {
    backgroundColor: "#FAEEDA",
    borderWidth: 1,
    borderColor: "#EF9F27",
  },
  flagButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#633806",
  },
  gotItButton: {
    backgroundColor: "#eef6ef",
    borderWidth: 1,
    borderColor: "#2f6b3a",
  },
  gotItButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2f6b3a",
  },

  endScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  endTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1a1a18",
    marginBottom: 8,
  },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e4da",
    padding: 16,
    alignItems: "center",
    width: "100%",
    gap: 4,
  },
  scoreLabel: {
    fontSize: 13,
    color: "#888780",
    fontWeight: "500",
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: "600",
    color: "#1a1a18",
  },
  reviewButton: {
    width: "100%",
    marginTop: 8,
  },
});
