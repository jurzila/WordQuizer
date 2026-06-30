import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Crypto from "expo-crypto";
import { useWordApp } from "../context/WordAppContext";
import { LessonsStackParamList } from "../navigation/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { sharedStyles } from "../theme/sharedStyles";

type NavProp = NativeStackNavigationProp<
  LessonsStackParamList,
  "AddWordScreen"
>;

export default function AddWordScreen() {
  const route = useRoute<RouteProp<LessonsStackParamList, "AddWordScreen">>();
  const navigation = useNavigation<NavProp>();
  const { collectionId } = route.params;
  const { handleAddWord } = useWordApp();
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");

  const handleSave = () => {
    if (!word.trim() || !translation.trim()) return;
    handleAddWord({
      id: Crypto.randomUUID().toString(),
      collectionId: collectionId,
      word: word.trim(),
      translation: translation.trim(),
    });
    setWord("");
    setTranslation("");
    navigation.goBack();
  };

  return (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.label}>Word</Text>
      <TextInput
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
    </View>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});
