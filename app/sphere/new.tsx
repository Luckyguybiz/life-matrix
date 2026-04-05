import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "../../lib/auth";
import { createSphere } from "../../lib/api";
import ColorPicker from "../../components/ColorPicker";
import IconPicker from "../../components/IconPicker";

export default function NewSphereScreen() {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("briefcase-outline");
  const [color, setColor] = useState("#3b82f6");
  const [targetLevel, setTargetLevel] = useState(10);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Ошибка", "Введите название сферы");
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      await createSphere(user.id, {
        name: name.trim(),
        icon,
        color,
        target_level: targetLevel,
      });
      router.back();
    } catch {
      Alert.alert("Ошибка", "Не удалось создать сферу");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: "Новая сфера",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
        }}
      />

      <Text style={styles.label}>Название</Text>
      <TextInput
        style={styles.input}
        placeholder="Например: Путешествия"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Цвет</Text>
      <ColorPicker selected={color} onSelect={setColor} />

      <Text style={[styles.label, { marginTop: 20 }]}>Иконка</Text>
      <IconPicker selected={icon} color={color} onSelect={setIcon} />

      <Text style={[styles.label, { marginTop: 20 }]}>
        Целевой уровень: {targetLevel}
      </Text>
      <View style={styles.levelRow}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <TouchableOpacity
            key={n}
            style={[
              styles.levelDot,
              n <= targetLevel && { backgroundColor: color },
            ]}
            onPress={() => setTargetLevel(n)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Создать сферу</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    padding: 16,
  },
  label: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  levelRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  levelDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});
