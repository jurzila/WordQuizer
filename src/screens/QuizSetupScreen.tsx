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

  const hasSelection = selectedIds.length > 0;

  return (
    <View style={sharedStyles.container}>
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
            const isSelected = selectedIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  sharedStyles.card,
                  styles.cardRow,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => toggleCollection(item.id)}
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

      <TouchableOpacity
        style={[
          sharedStyles.primaryButton,
          !hasSelection && sharedStyles.primaryButtonDisabled,
          styles.startButton,
        ]}
        onPress={startQuiz}
        disabled={!hasSelection}
      >
        <Text style={sharedStyles.primaryButtonText}>
          {hasSelection ? "Start quiz" : "Select a lesson to begin"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, color: "#888780", marginBottom: 20 },

  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardSelected: { borderColor: "#2f6b3a", backgroundColor: "#eef6ef" },
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

  startButton: { marginTop: "auto" },
});
