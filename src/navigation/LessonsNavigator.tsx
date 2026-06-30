import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LessonsStackParamList } from "./types";
import AddWordScreen from "../screens/AddWordScreen";
import LessonDetailScreen from "../screens/LessonDetailsScreen";
import LessonsScreen from "../screens/LessonsScreen";

const Stack = createNativeStackNavigator<LessonsStackParamList>()

export default function LessonsNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="LessonsScreen" component={LessonsScreen} />
            <Stack.Screen name="LessonDetailScreen" component={LessonDetailScreen} />
            <Stack.Screen name="AddWordScreen" component={AddWordScreen} />
        </Stack.Navigator>
    )
}