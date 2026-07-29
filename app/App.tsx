import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useWordApp, WordAppProvider } from "./src/context/WordAppContext";
import QuizNavigator from "./src/navigation/QuizNavigator";
import LessonsNavigator from "./src/navigation/LessonsNavigator";
import { View, Text } from "react-native";
import AuthScreen from "./src/screens/AuthScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <WordAppProvider>
      <AppNavigator />
    </WordAppProvider>
  );
}

function AppNavigator() {
  const { token, isLoading } = useWordApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? (
        <Tab.Navigator>
          <Tab.Screen name="Lessons" component={LessonsNavigator} />
          <Tab.Screen name="Quiz" component={QuizNavigator} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}
