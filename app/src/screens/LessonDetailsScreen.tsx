import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useWordApp } from "../context/WordAppContext";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { LessonsStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { sharedStyles } from "../theme/sharedStyles";

type NavProp = NativeStackNavigationProp<
  LessonsStackParamList,
  "LessonDetailScreen"
>;

export default function LessonDetailScreen() {
  const route =
    useRoute<RouteProp<LessonsStackParamList, "LessonDetailScreen">>();
  const navigation = useNavigation<NavProp>();
  const { collectionId, collectionName } = route.params;
  const { words, handleDeleteWord } = useWordApp();
  const lessonWord = words.filter((word) => word.collectionId === collectionId);

  const openAddWord = () => {
    navigation.navigate("AddWordScreen", {
      collectionId: collectionId,
    });
  };

  return (
    <View style={sharedStyles.container}>
      <Text style={[sharedStyles.title, styles.title]}>{collectionName}</Text>

      {lessonWord.length === 0 && (
        <View style={sharedStyles.emptyState}>
          <Text style={sharedStyles.emptyText}>No words in lesson yet.</Text>
          <Text style={sharedStyles.emptySubtext}>Add words.</Text>
        </View>
      )}

      <FlatList
        data={lessonWord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={sharedStyles.list}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={sharedStyles.card}>
            <View style={sharedStyles.cardRow}>
              <Text style={styles.word}>{item.word}</Text>
              <Text style={styles.translation}>{item.translation}</Text>
              <TouchableOpacity onPress={() => handleDeleteWord(item.id)}>
                <Text style={sharedStyles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={[sharedStyles.primaryButton, styles.button]}
        onPress={openAddWord}
      >
        <Text style={sharedStyles.primaryButtonText}>+ New Word</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  word: { fontSize: 16, fontWeight: "bold" },
  translation: { fontSize: 16, color: "#555" },
  title: { marginBottom: 16 },
  list: { flex: 1 },
  button: { marginTop: 16 },
});
