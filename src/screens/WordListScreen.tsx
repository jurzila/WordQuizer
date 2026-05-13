import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { Word } from '../types'
import { useState } from 'react'

type Props = {
    words: Word[]
    onDelete: (id: string) => void
}

export default function WordListScreen({words, onDelete}: Props) {
    return (
        <View style={styles.container}>
            <FlatList data={words} keyExtractor={(item) => item.id} renderItem={({item}) => (
                <View style={styles.card}>
                    <Text style={styles.word}>{item.word}</Text>
                    <Text style={styles.translation}>{item.translation}</Text>
                    <TouchableOpacity onPress={() => onDelete(item.id)}>
                        <Text style={styles.deletionButton}>x</Text>
                    </TouchableOpacity>
                </View>
            )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16},
    card: {
        flexDirection: "row",
        justifyContent: 'space-between',
        padding: 16,
        marginBottom: 8,
        backgroundColor: "#e2f5ba",
        borderRadius: 8,
        gap: 8
    },
    word: { fontSize: 16, fontWeight: 'bold'},
    translation: {fontSize: 16, color: "#555"},
    deletionButton: {fontSize: 16, paddingLeft: 12}
})