import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { Word } from '../types'
import * as Crypto from 'expo-crypto'

type Props = {
    onAdd: (word: Word) => void
}

export default function AddWordScreen({onAdd}: Props) {
const [word, setWord] = useState('')
const [translation, setTranslation] = useState('')

const handleSave = () => {
    if (!word.trim() || !translation.trim()) return;
    onAdd({id: Crypto.randomUUID().toString(), word: word.trim(), translation: translation.trim()})
    setWord('')
    setTranslation('')
}

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Word</Text>
            <TextInput style={styles.input} value={word} onChangeText={setWord} placeholder="add a word" />
            <Text style={styles.label}>Translation</Text>
            <TextInput style={styles.input} value={translation} onChangeText={setTranslation} placeholder="add a translation" />
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Word</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16},
    label: { fontSize: 14, fontWeight: "bold", marginBottom: 4, marginTop: 16},
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 ,fontSize: 16},
    button: {
        backgroundColor: "#4CAF50",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 24
    },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16}
})