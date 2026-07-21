import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { useWordApp } from "../context/WordAppContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LessonsStackParamList } from "../navigation/types";
import { useState } from "react";
import { Collection } from "../types";
import { sharedStyles } from "../theme/sharedStyles";

type NavProp = NativeStackNavigationProp<
  LessonsStackParamList,
  "LessonsScreen"
>;

export default function LessonsScreen() {
  const {
    collections,
    handleAddCollection,
    handleDeleteCollection,
    handleRenameCollection,
  } = useWordApp();
  const navigation = useNavigation<NavProp>();

  const [isCreating, setIsCreating] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // --- create ---

  const openCreateForm = () => setIsCreating(true);

  const cancelCreate = () => {
    setIsCreating(false);
    setCollectionName("");
  };

  const confirmCreate = () => {
    if (!collectionName.trim()) return;
    handleAddCollection(collectionName.trim());
    cancelCreate();
  };

  // --- rename ---

  const openRename = (item: Collection) => {
    setEditingId(item._id);
    setEditText(item.name);
  };

  const cancelRename = () => setEditingId(null);

  const confirmRename = () => {
    if (editingId && editText.trim()) {
      handleRenameCollection(editingId, editText.trim());
    }
    setEditingId(null);
  };

  // --- navigation ---

  const openLesson = (item: Collection) => {
    navigation.navigate("LessonDetailScreen", {
      collectionId: item._id,
      collectionName: item.name,
    });
  };

  return (
    <View style={sharedStyles.container}>
      <View style={styles.header}>
        <Text style={sharedStyles.title}>Lessons</Text>
        {!isCreating && (
          <TouchableOpacity
            style={sharedStyles.primaryButton}
            onPress={openCreateForm}
          >
            <Text style={sharedStyles.primaryButtonText}>+ New lesson</Text>
          </TouchableOpacity>
        )}
      </View>

      {isCreating && (
        <View style={sharedStyles.formCard}>
          <Text style={sharedStyles.label}>Lesson name</Text>
          <TextInput
            style={sharedStyles.input}
            value={collectionName}
            onChangeText={setCollectionName}
            placeholder="e.g. Greetings"
            autoFocus
          />
          <View style={sharedStyles.formActions}>
            <TouchableOpacity
              style={sharedStyles.secondaryButton}
              onPress={cancelCreate}
            >
              <Text style={sharedStyles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={sharedStyles.primaryButton}
              onPress={confirmCreate}
            >
              <Text style={sharedStyles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {collections.length === 0 && !isCreating && (
        <View style={sharedStyles.emptyState}>
          <Text style={sharedStyles.emptyText}>No lessons yet.</Text>
          <Text style={sharedStyles.emptySubtext}>
            Create one to start adding words.
          </Text>
        </View>
      )}

      <FlatList
        data={collections}
        keyExtractor={(item) => item._id}
        contentContainerStyle={sharedStyles.list}
        renderItem={({ item }) => {
          const isEditing = item._id === editingId;

          return (
            <View style={sharedStyles.card}>
              {isEditing ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={[sharedStyles.input, styles.editInput]}
                    value={editText}
                    onChangeText={setEditText}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={sharedStyles.textButton}
                    onPress={confirmRename}
                  >
                    <Text style={sharedStyles.textButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={sharedStyles.textButton}
                    onPress={cancelRename}
                  >
                    <Text style={sharedStyles.textButtonTextMuted}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={sharedStyles.cardRow}>
                  <TouchableOpacity
                    style={styles.cardTouchable}
                    onPress={() => openLesson(item)}
                  >
                    <Text style={sharedStyles.cardTitle}>{item.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={sharedStyles.textButton}
                    onPress={() => openRename(item)}
                  >
                    <Text style={sharedStyles.textButtonTextMuted}>Rename</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={sharedStyles.textButton}
                    onPress={() => handleDeleteCollection(item._id)}
                  >
                    <Text style={sharedStyles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTouchable: { flex: 1 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  editInput: { flex: 1 },
});
