import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useWordApp } from "../context/WordAppContext";
import { LessonsStackParamList } from "../navigation/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { sharedStyles } from "../theme/sharedStyles";

export default function AddWordScreen() {
  const route = useRoute<RouteProp<LessonsStackParamList, "AddWordScreen">>();
  const { collectionId } = route.params;
  const { handleAddWord } = useWordApp();
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [saved, setSaved] = useState(false);
  const wordInputRef = useRef<TextInput>(null);

  const handleSave = () => {
    if (!word.trim() || !translation.trim()) return;
    handleAddWord(word.trim(), translation.trim(), collectionId);
    setWord("");
    setTranslation("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    wordInputRef.current?.focus();
  };

  return (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.label}>Word</Text>
      <TextInput
        ref={wordInputRef}
        style={[sharedStyles.input, styles.input]}
        value={word}
        onChangeText={setWord}
        placeholder="add a word"
      />
      <Text style={sharedStyles.label}>Translation</Text>
      <TextInput
        style={[sharedStyles.input, styles.input]}
        value={translation}
        onChangeText={setTranslation}
        placeholder="add a translation"
      />
      <TouchableOpacity
        style={[sharedStyles.primaryButton, styles.button]}
        onPress={handleSave}
      >
        <Text style={sharedStyles.primaryButtonText}>Save Word</Text>
      </TouchableOpacity>
      {saved && <Text style={styles.savedMessage}>Word saved!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 16 },
  button: { marginTop: 8 },

  savedMessage: {
    color: "#2f6b3a",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
