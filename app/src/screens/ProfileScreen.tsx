import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useWordApp } from "../context/WordAppContext";
import { sharedStyles } from "../theme/sharedStyles";

export default function ProfileScreen() {
  const { handleLogout, email } = useWordApp();

  return (
    <View style={sharedStyles.container}>
      <Text style={[sharedStyles.title, styles.title]}>Profile</Text>
      <Text>{email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 24 },
  logoutButton: {
    marginTop: "auto",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F09595",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A32D2D",
  },
});
