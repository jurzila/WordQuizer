import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useWordApp } from "../context/WordAppContext";

export default function GlobalFeedback({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, error } = useWordApp();

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#2f6b3a" />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorBanner: {
    backgroundColor: "#FCEBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#F09595",
    padding: 12,
    alignItems: "center",
  },
  errorText: {
    fontSize: 13,
    color: "#A32D2D",
    fontWeight: "500",
  },
  loadingBar: {
    backgroundColor: "#eef6ef",
    padding: 8,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2f6b3a",
  },
});
