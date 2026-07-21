import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
  const navigation = useNavigation<NavProp>();

  function toggleCollection(selectedCollectionId: string) {
    setSelectedIds((prev) =>
      prev.includes(selectedCollectionId)
        ? prev.filter((collectionId) => collectionId !== selectedCollectionId)
        : [...prev, selectedCollectionId],
    );
  }

  const startQuiz = () => {
    navigation.navigate("QuizScreen", {
      collectionIds: selectedIds,
    });
  };

  const startFlashcards = () => {
    navigation.navigate("FlashcardScreen", {
      collectionIds: selectedIds,
      mode,
    });
  };

  const hasSelection = selectedIds.length > 0;

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
        <View style={sharedStyles.list}>
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
        </View>
      )}
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
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.quizButton,
            !hasSelection && styles.buttonDisabled,
          ]}
          onPress={startQuiz}
          disabled={!hasSelection}
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
          disabled={!hasSelection}
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
});
