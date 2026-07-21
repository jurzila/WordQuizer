import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { WordAppProvider } from "./src/context/WordAppContext";
import QuizNavigator from "./src/navigation/QuizNavigator";
import LessonsNavigator from "./src/navigation/LessonsNavigator";

const Tab = createBottomTabNavigator();

export default function App() {

  return (
    <WordAppProvider>
      <NavigationContainer>
        <Tab.Navigator >
          <Tab.Screen name="Lessons" component={LessonsNavigator} />
          <Tab.Screen name="Quiz" component={QuizNavigator} />
        </Tab.Navigator>
      </NavigationContainer>
    </WordAppProvider>
  );
}
