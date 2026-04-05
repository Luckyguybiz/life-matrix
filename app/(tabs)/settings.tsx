import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
      { text: "Отмена", style: "cancel" },
      { text: "Выйти", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={32} color="#888" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.email}>{user?.email || "—"}</Text>
          <Text style={styles.hint}>Life Matrix v1.0.0</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color="#ff4444" />
        <Text style={styles.menuTextDanger}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    gap: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    color: "#888",
    fontSize: 13,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  menuTextDanger: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "500",
  },
});
