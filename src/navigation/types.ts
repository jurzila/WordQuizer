export type LessonsStackParamList = {
    LessonsScreen: undefined
    LessonDetailScreen: { collectionId: string, collectionName: string }
    AddWordScreen: { collectionId: string }
}

export type QuizStackParamList = {
    QuizSetupScreen: undefined
    QuizScreen: { collectionIds: string[] }
}