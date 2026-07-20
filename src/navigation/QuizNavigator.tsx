import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QuizStackParamList } from "./types";
import QuizScreen from "../screens/QuizScreen";
import QuizSetupScreen from "../screens/QuizSetupScreen";
import FlashcardScreen from "../screens/FlashcardScreen";

const Stack = createNativeStackNavigator<QuizStackParamList>();

export default function QuizNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="QuizSetupScreen" component={QuizSetupScreen} />
      <Stack.Screen name="QuizScreen" component={QuizScreen} />
      <Stack.Screen name="FlashcardScreen" component={FlashcardScreen} />
    </Stack.Navigator>
  );
}
