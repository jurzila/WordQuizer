export type LessonsStackParamList = {
    LessonsScreen: undefined
    LessonDetailScreen: { collectionId: string, collectionName: string }
    AddWordScreen: { collectionId: string }
}

export type QuizStackParamList = {
    QuizSetupScreen: undefined
    QuizScreen: { collectionIds: string[], wordLimit: number | 'all' }
    FlashcardScreen: { collectionIds: string[], mode: 'word' | 'translation', wordLimit: number | 'all' }
}