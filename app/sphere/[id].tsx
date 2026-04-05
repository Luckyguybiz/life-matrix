import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchSphere,
  deleteSphere,
  type Sphere,
  type Project,
} from "../../lib/api";
import ProjectCard from "../../components/ProjectCard";
import ProgressBar from "../../components/ProgressBar";
import EmptyState from "../../components/EmptyState";

export default function SphereDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sphere, setSphere] = useState<Sphere | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  async function loadSphere() {
    try {
      const data = await fetchSphere(id);
      setSphere(data);
    } catch {
      Alert.alert("Ошибка", "Не удалось загрузить сферу");
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadSphere().finally(() => setLoading(false));
    }, [id])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadSphere();
    setRefreshing(false);
  }

  function handleDelete() {
    Alert.alert("Удалить сферу", "Все проекты внутри будут удалены.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSphere(id);
            router.back();
          } catch {
            Alert.alert("Ошибка", "Не удалось удалить");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!sphere) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Сфера не найдена</Text>
      </View>
    );
  }

  const projects = (sphere.projects || []).sort(
    (a: Project, b: Project) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const progressPercent =
    sphere.target_level > 0
      ? (sphere.current_level / sphere.target_level) * 100
      : 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: sphere.name,
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#ff4444" />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            color={sphere.color}
            onPress={() => router.push(`/project/${item.id}`)}
          />
        )}
        contentContainerStyle={
          projects.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: sphere.color + "20" }]}>
              <Ionicons
                name={sphere.icon as keyof typeof Ionicons.glyphMap}
                size={32}
                color={sphere.color}
              />
            </View>
            <Text style={styles.levelText}>
              Уровень: {sphere.current_level} / {sphere.target_level}
            </Text>
            <View style={styles.progressRow}>
              <ProgressBar
                progress={progressPercent}
                color={sphere.color}
                height={10}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="Нет проектов"
            subtitle="Добавьте первый проект в эту сферу"
            buttonText="Добавить проект"
            onPress={() =>
              router.push({ pathname: "/project/new", params: { sphereId: id } })
            }
          />
        }
      />

      {projects.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: sphere.color }]}
          onPress={() =>
            router.push({ pathname: "/project/new", params: { sphereId: id } })
          }
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#888",
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  levelText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  progressRow: {
    width: "100%",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
