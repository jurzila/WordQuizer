import { useState } from "react";
import { TextInput, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useWordApp } from "../context/WordAppContext";
import { sharedStyles } from "../theme/sharedStyles";

export default function AuthScreen() {
  const { handleLogin, handleRegister } = useWordApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterPress = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await handleRegister(email.trim(), password.trim());
      setEmail("");
      setPassword("");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  const handleLoginPress = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await handleLogin(email.trim(), password.trim());
      setEmail("");
      setPassword("");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.appName}>WordQuizer</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? "Create an account" : "Welcome back"}
        </Text>

        <Text style={sharedStyles.label}>Email</Text>
        <TextInput
          style={sharedStyles.input}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          placeholder="example@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[sharedStyles.label, styles.passwordLabel]}>Password</Text>
        <TextInput
          style={sharedStyles.input}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          placeholder="password"
          secureTextEntry={true}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[sharedStyles.primaryButton, styles.submitButton]}
          onPress={isRegistering ? handleRegisterPress : handleLoginPress}
        >
          <Text style={sharedStyles.primaryButtonText}>
            {isRegistering ? "Create account" : "Sign in"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => {
            setIsRegistering(!isRegistering)
            setError(null)
          }}
        >
          <Text style={styles.toggleText}>
            {isRegistering
              ? "Already have an account? "
              : "Don't have an account? "}
            <Text style={styles.toggleLink}>
              {isRegistering ? "Sign in" : "Register"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf8",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#e6e4da",
  },
  appName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1a1a18",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#888780",
    marginBottom: 24,
  },
  passwordLabel: {
    marginTop: 16,
  },
  errorBox: {
    backgroundColor: "#FCEBEB",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F09595",
  },
  errorText: {
    fontSize: 13,
    color: "#A32D2D",
  },
  submitButton: {
    marginTop: 20,
  },
  toggleButton: {
    marginTop: 16,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 13,
    color: "#888780",
  },
  toggleLink: {
    color: "#2f6b3a",
    fontWeight: "600",
  },
});