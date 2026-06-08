import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Word } from '../types'
import { useEffect, useState } from 'react'

type Props = {
    words: Word[]
}

// function shuffle<T>(array: T[]): T[] {
//     return[...array].sort(() => Math.random() - 0.5)
// }
// Apply Fisher-Yates implementation instead
function shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for(let i = result.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const temp = result[i]
        result[i] = result[randomIndex]
        result[randomIndex] = temp
    }
    return result
}

export default function QuizScreen({words}: Props) {
    const [quizWords, setQuizWords] = useState<Word[]>([])
    const [translations, setTranslations] = useState<Word[]>([])
    const [selectedWord, setSelectedWord] = useState<Word | null>(null)
    const [matched, setMatched] = useState<string[]>([])
    const [wrong, setWrong] = useState<string | null>(null)

    useEffect(() => {
        startQuiz()
    }, [words])

    const startQuiz = () => {
        const picked = shuffle(words).slice(0, 5)
        setQuizWords(picked)
        setTranslations(shuffle(picked))
        setSelectedWord(null)
        setMatched([])
        setWrong(null)
    }

    const handleWordPress = (item: Word) => {
        if (matched.includes(item.id)) return
        setSelectedWord(item)
    }

    const handleTranslationPress = (item: Word) => {
        if (matched.includes(item.id)) return
        if (!selectedWord) return

        if (selectedWord.id === item.id) {
            setMatched((prev) => [...prev, item.id])
            setSelectedWord(null)
            setWrong(null)
        } else {
            setWrong(item.id)
            setTimeout(() => {
                setWrong(null)
                setSelectedWord(null)
            }, 800)
        }
    }

    if (words.length < 2) {
        return (
        <View style={styles.container}>
            <Text>Add at least 2 words to start a quiz!</Text>
        </View>
        )
    }

    const isFinished = matched.length === quizWords.length

    return (
        <View style={styles.container}>
            {isFinished ? (
                <View style={styles.result}>
                    <Text style={styles.resultText}>All matched!</Text>
                    <TouchableOpacity style={styles.button} onPress={startQuiz}>
                        <Text style={styles.buttonText}>Play Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <Text style={styles.title}>Match The Pairs</Text>
                    <View style={styles.columns}>
                        <View style={styles.column}>
                            {quizWords.map((item) => {
                                const isMatched = matched.includes(item.id)
                                const isSelected = selectedWord?.id === item.id
                                return (
                                    <TouchableOpacity 
                                    key={item.id} 
                                    style={[
                                        styles.card,
                                        isMatched && styles.cardMatched,
                                        isSelected && styles.cardSelected
                                    ]}
                                    onPress={() => handleWordPress(item)} 
                                    disabled={isMatched}>
                                        <Text style={styles.cardText}>{item.word}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>

                        <View style={styles.column}>
                            {translations.map((item) => {
                                const isMatched = matched.includes(item.id)
                                const isWrong = wrong === item.id
                                return (
                                    <TouchableOpacity 
                                    key={item.id}
                                    style={[
                                        styles.card,
                                        isMatched && styles.cardMatched,
                                        isWrong && styles.cardWrong
                                    ]} 
                                    onPress={() => handleTranslationPress(item)} 
                                    disabled={isMatched}>
                                        <Text style={styles.cardText}>{item.translation}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16},
    title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 24},
    columns: { flexDirection: "row", justifyContent: "space-between"},
    column: { flex: 1, gap: 12, marginHorizontal: 4},
    card: {
        padding: 16,
        backgroundColor: "#9ad1e6",
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent"
    },
    cardSelected: { borderColor: "#236c87", backgroundColor: "#1ab0e8"},
    cardMatched: { borderColor: "#3c802b", backgroundColor: "#81d66b"},
    cardWrong: { borderColor: "#5e2224", backgroundColor: "#c9181e"},
    cardText: { fontSize: 15, textAlign: "center"},
    result: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16},
    resultText: { fontSize: 28, fontWeight: "bold"},
    button: {backgroundColor: "#acaf50", padding: 16, borderRadius: 8},
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16}
})