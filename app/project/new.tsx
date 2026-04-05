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
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useAuth } from "../../lib/auth";
import { createProject, recalculateSphereLevel } from "../../lib/api";

export default function NewProjectScreen() {
  const { sphereId } = useLocalSearchParams<{ sphereId: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointA, setPointA] = useState("");
  const [pointB, setPointB] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Введите название проекта");
      return;
    }

    if (!user || !sphereId) return;

    setSaving(true);
    try {
      await createProject(user.id, sphereId, {
        title: title.trim(),
        description: description.trim(),
        point_a: pointA.trim(),
        point_b: pointB.trim(),
      });
      await recalculateSphereLevel(sphereId);
      router.back();
    } catch {
      Alert.alert("Ошибка", "Не удалось создать проект");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: "Новый проект",
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
        }}
      />

      <Text style={styles.label}>Название</Text>
      <TextInput
        style={styles.input}
        placeholder="Например: Пробежать марафон"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Точка А — где сейчас</Text>
      <TextInput
        style={styles.input}
        placeholder="Не могу пробежать 1 км"
        placeholderTextColor="#666"
        value={pointA}
        onChangeText={setPointA}
      />

      <Text style={styles.label}>Точка Б — куда хочу</Text>
      <TextInput
        style={styles.input}
        placeholder="Пробежать марафон 42 км"
        placeholderTextColor="#666"
        value={pointB}
        onChangeText={setPointB}
      />

      <Text style={styles.label}>Описание (опционально)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Детали, заметки..."
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Создать проект</Text>
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
  textArea: {
    minHeight: 100,
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
