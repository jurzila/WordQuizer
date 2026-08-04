import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { useWordApp } from "../context/WordAppContext";
import { useState } from "react";
import { QuizStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { sharedStyles } from "../theme/sharedStyles";

type NavProp = NativeStackNavigationProp<QuizStackParamList, "QuizSetupScreen">;

export default function QuizSetupScreen() {
  const { collections } = useWordApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"word" | "translation">("word");
  const [wordLimit, setWordLimit] = useState<number | "all">("all");
  const [customLimit, setCustomLimit] = useState<number>(20);
  const navigation = useNavigation<NavProp>();

  function toggleCollection(selectedCollectionId: string) {
    setSelectedIds((prev) =>
      prev.includes(selectedCollectionId)
        ? prev.filter((collectionId) => collectionId !== selectedCollectionId)
        : [...prev, selectedCollectionId],
    );
  }

  const { words } = useWordApp();
  const availableCount = words.filter((word) =>
    selectedIds.includes(word.collectionId),
  ).length;
  const canUseCustom = availableCount >= 20;

  const startQuiz = () => {
    navigation.navigate("QuizScreen", {
      collectionIds: selectedIds,
      wordLimit: wordLimit === "all" ? "all" : customLimit,
    });
  };

  const startFlashcards = () => {
    navigation.navigate("FlashcardScreen", {
      collectionIds: selectedIds,
      mode,
      wordLimit: wordLimit === "all" ? "all" : customLimit,
    });
  };

  const hasSelection = selectedIds.length > 0;
  const isValidLimit =
    wordLimit === "all" || (customLimit >= 20 && customLimit <= availableCount);

  return (
    <View style={[sharedStyles.container, { alignItems: "stretch" }]}>
      <Text style={sharedStyles.title}>Start a quiz</Text>
      <Text style={styles.subtitle}>
        Pick one or more lessons to quiz yourself on
      </Text>

      {collections.length === 0 ? (
        <View style={sharedStyles.emptyState}>
          <Text style={sharedStyles.emptyText}>No lessons yet.</Text>
          <Text style={sharedStyles.emptySubtext}>
            Create a lesson first to start a quiz.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={sharedStyles.list}>
          {collections.map((item) => {
            const isSelected = selectedIds.includes(item._id);
            return (
              <TouchableOpacity
                key={item._id}
                style={[
                  sharedStyles.card,
                  styles.cardRow,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => toggleCollection(item._id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text
                  style={[
                    sharedStyles.cardTitle,
                    isSelected && styles.cardTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      {hasSelection && (
        <>
          <View style={styles.modeSelector}>
            <Text style={styles.modeSelectorLabel}>Flashcard direction</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "word" && styles.modeButtonActive,
                ]}
                onPress={() => setMode("word")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === "word" && styles.modeButtonTextActive,
                  ]}
                >
                  Word → Translation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === "translation" && styles.modeButtonActive,
                ]}
                onPress={() => setMode("translation")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === "translation" && styles.modeButtonTextActive,
                  ]}
                >
                  Translation → Word
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.modeSelector}>
            <Text style={styles.modeSelectorLabel}>Word count</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  wordLimit === "all" && styles.modeButtonActive,
                ]}
                onPress={() => setWordLimit("all")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    wordLimit === "all" && styles.modeButtonTextActive,
                  ]}
                >
                  All words
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  wordLimit !== "all" && styles.modeButtonActive,
                ]}
                onPress={() => setWordLimit(customLimit)}
                disabled={!canUseCustom}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    wordLimit !== "all" && styles.modeButtonTextActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {!canUseCustom && hasSelection && (
              <Text style={styles.warningText}>
                Need at least 20 words for custom limit
              </Text>
            )}

            {wordLimit !== "all" && (
              <View style={styles.customInputRow}>
                <Text style={styles.modeSelectorLabel}>
                  Number of words (min 20)
                </Text>
                <TextInput
                  style={[sharedStyles.input, styles.customInput]}
                  value={customLimit.toString()}
                  onChangeText={(text) => {
                    const num = Number(text);
                    setCustomLimit(num);
                    setWordLimit(num);
                  }}
                  placeholder="20"
                  keyboardType="numeric"
                />
                {customLimit < 20 && (
                  <Text style={styles.warningText}>Minimum is 20 words</Text>
                )}
                {customLimit > availableCount && availableCount > 0 && (
                  <Text style={styles.warningText}>
                    Only {availableCount} words available
                  </Text>
                )}
              </View>
            )}
          </View>
        </>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.quizButton,
            !hasSelection && styles.buttonDisabled,
          ]}
          onPress={startQuiz}
          disabled={!hasSelection || !isValidLimit}
        >
          <Text style={sharedStyles.primaryButtonText}>Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.flashcardButton,
            !hasSelection && styles.buttonDisabled,
          ]}
          onPress={startFlashcards}
          disabled={!hasSelection || !isValidLimit}
        >
          <Text
            style={[
              sharedStyles.secondaryButtonText,
              !hasSelection && { color: "#fff" },
              hasSelection && { color: "#2f6b3a" },
            ]}
          >
            Flashcards
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, color: "#888780", marginBottom: 20 },

  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardSelected: { borderColor: "#2f6b3a", backgroundColor: "#f6f6ee" },
  cardTextSelected: { color: "#2f6b3a", fontWeight: "600" },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#d8d6cd",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { borderColor: "#2f6b3a", backgroundColor: "#2f6b3a" },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "700" },

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quizButton: {
    backgroundColor: "#2f6b3a",
  },
  flashcardButton: {
    borderWidth: 1,
    borderColor: "#2f6b3a",
  },
  buttonDisabled: {
    backgroundColor: "#d8d6cd",
    borderColor: "#d8d6cd",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: "auto",
    width: "100%",
  },
  modeSelector: { marginBottom: 16 },
  modeSelectorLabel: {
    fontSize: 13,
    color: "#888780",
    marginBottom: 8,
    fontWeight: "500",
  },
  modeRow: { flexDirection: "row", gap: 8 },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d8d6cd",
  },
  modeButtonActive: { borderColor: "#2f6b3a", backgroundColor: "#eef6ef" },
  modeButtonText: { fontSize: 13, fontWeight: "500", color: "#888780" },
  modeButtonTextActive: { color: "#2f6b3a", fontWeight: "600" },
  warningText: { fontSize: 12, color: "#854F0B", marginTop: 4 },

  customInputRow: { marginTop: 10, gap: 6 },
  customInput: { width: 100 },
});
