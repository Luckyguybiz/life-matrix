import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";
import {
  fetchProject,
  updateProject,
  deleteProject,
  createMilestone,
  toggleMilestone,
  deleteMilestone,
  recalculateSphereLevel,
  type Project,
  type Milestone,
} from "../../lib/api";
import ProgressBar from "../../components/ProgressBar";
import MilestoneItem from "../../components/MilestoneItem";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newMilestone, setNewMilestone] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  async function loadProject() {
    try {
      const data = await fetchProject(id);
      setProject(data);
      if (data) setProgress(data.progress);
    } catch {
      Alert.alert("Ошибка", "Не удалось загрузить проект");
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadProject().finally(() => setLoading(false));
    }, [id])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadProject();
    setRefreshing(false);
  }

  async function handleProgressChange(value: number) {
    setProgress(value);
    if (!project) return;
    try {
      await updateProject(id, { progress: value });
      await recalculateSphereLevel(project.sphere_id);
    } catch {
      // revert on error
      setProgress(project.progress);
    }
  }

  async function handleAddMilestone() {
    if (!newMilestone.trim() || !user || !project) return;

    try {
      await createMilestone(user.id, id, newMilestone.trim());
      setNewMilestone("");
      await loadProject();
    } catch {
      Alert.alert("Ошибка", "Не удалось добавить");
    }
  }

  async function handleToggleMilestone(milestoneId: string, completed: boolean) {
    try {
      await toggleMilestone(milestoneId, completed);
      await loadProject();
    } catch {
      Alert.alert("Ошибка", "Не удалось обновить");
    }
  }

  async function handleDeleteMilestone(milestoneId: string) {
    try {
      await deleteMilestone(milestoneId);
      await loadProject();
    } catch {
      Alert.alert("Ошибка", "Не удалось удалить");
    }
  }

  function handleDeleteProject() {
    if (!project) return;
    Alert.alert("Удалить проект", `Удалить "${project.title}"?`, [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            const sphereId = project.sphere_id;
            await deleteProject(id);
            await recalculateSphereLevel(sphereId);
            router.back();
          } catch {
            Alert.alert("Ошибка", "Не удалось удалить");
          }
        },
      },
    ]);
  }

  async function handleStatusToggle() {
    if (!project) return;
    const newStatus = project.status === "active" ? "completed" : "active";
    try {
      await updateProject(id, {
        status: newStatus,
        progress: newStatus === "completed" ? 100 : project.progress,
      });
      await recalculateSphereLevel(project.sphere_id);
      await loadProject();
    } catch {
      Alert.alert("Ошибка", "Не удалось обновить статус");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#888" }}>Проект не найден</Text>
      </View>
    );
  }

  const milestones = (project.milestones || []).sort(
    (a: Milestone, b: Milestone) => a.sort_order - b.sort_order
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      <Stack.Screen
        options={{
          title: project.title,
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteProject}>
              <Ionicons name="trash-outline" size={22} color="#ff4444" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Status toggle */}
      <TouchableOpacity style={styles.statusButton} onPress={handleStatusToggle}>
        <Ionicons
          name={project.status === "completed" ? "checkmark-circle" : "ellipse-outline"}
          size={20}
          color={project.status === "completed" ? "#4ade80" : "#888"}
        />
        <Text style={styles.statusText}>
          {project.status === "completed" ? "Завершён" : "Активный"}
        </Text>
      </TouchableOpacity>

      {/* Points A → B */}
      <View style={styles.pointsRow}>
        <View style={styles.pointCard}>
          <Text style={styles.pointLabel}>Точка А</Text>
          <Text style={styles.pointValue}>{project.point_a || "—"}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#555" />
        <View style={styles.pointCard}>
          <Text style={styles.pointLabel}>Точка Б</Text>
          <Text style={styles.pointValue}>{project.point_b || "—"}</Text>
        </View>
      </View>

      {/* Progress */}
      <Text style={styles.sectionTitle}>Прогресс</Text>
      <ProgressBar progress={progress} color="#8b5cf6" height={12} />
      <View style={styles.sliderRow}>
        {[0, 25, 50, 75, 100].map((val) => (
          <TouchableOpacity
            key={val}
            style={[
              styles.sliderButton,
              progress === val && styles.sliderButtonActive,
            ]}
            onPress={() => handleProgressChange(val)}
          >
            <Text
              style={[
                styles.sliderButtonText,
                progress === val && styles.sliderButtonTextActive,
              ]}
            >
              {val}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom progress input */}
      <View style={styles.customProgressRow}>
        <TouchableOpacity
          style={styles.progressAdjust}
          onPress={() => handleProgressChange(Math.max(0, progress - 5))}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.progressValue}>{progress}%</Text>
        <TouchableOpacity
          style={styles.progressAdjust}
          onPress={() => handleProgressChange(Math.min(100, progress + 5))}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Description */}
      {project.description ? (
        <>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{project.description}</Text>
        </>
      ) : null}

      {/* Milestones */}
      <Text style={styles.sectionTitle}>
        Этапы ({milestones.filter((m: Milestone) => m.is_completed).length}/
        {milestones.length})
      </Text>

      {milestones.map((m: Milestone) => (
        <MilestoneItem
          key={m.id}
          milestone={m}
          onToggle={handleToggleMilestone}
          onDelete={handleDeleteMilestone}
        />
      ))}

      <View style={styles.addMilestoneRow}>
        <TextInput
          style={styles.milestoneInput}
          placeholder="Новый этап..."
          placeholderTextColor="#666"
          value={newMilestone}
          onChangeText={setNewMilestone}
          onSubmitEditing={handleAddMilestone}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMilestone}
          disabled={!newMilestone.trim()}
        >
          <Ionicons
            name="add-circle"
            size={32}
            color={newMilestone.trim() ? "#8b5cf6" : "#444"}
          />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  pointCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
  },
  pointLabel: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pointValue: {
    color: "#fff",
    fontSize: 14,
  },
  sectionTitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  sliderRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  sliderButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
  },
  sliderButtonActive: {
    backgroundColor: "#8b5cf6",
  },
  sliderButtonText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  sliderButtonTextActive: {
    color: "#fff",
  },
  customProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
    marginTop: 4,
  },
  progressAdjust: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  progressValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "center",
  },
  description: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  addMilestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  milestoneInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#fff",
  },
  addButton: {
    padding: 4,
  },
});
