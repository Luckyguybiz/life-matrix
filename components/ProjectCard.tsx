import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProgressBar from "./ProgressBar";
import type { Project } from "../lib/api";

interface Props {
  project: Project;
  color: string;
  onPress: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Активный", color: "#4ade80" },
  completed: { label: "Завершён", color: "#3b82f6" },
  paused: { label: "Н�� паузе", color: "#fbbf24" },
  archived: { label: "Архив", color: "#888" },
};

export default function ProjectCard({ project, color, onPress }: Props) {
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {project.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: status.color + "20" }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {(project.point_a || project.point_b) && (
        <View style={styles.points}>
          <Text style={styles.pointText} numberOfLines={1}>
            A: {project.point_a || "—"}
          </Text>
          <Ionicons name="arrow-forward" size={14} color="#555" />
          <Text style={styles.pointText} numberOfLines={1}>
            B: {project.point_b || "—"}
          </Text>
        </View>
      )}

      <ProgressBar progress={project.progress} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  points: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointText: {
    color: "#888",
    fontSize: 12,
    flex: 1,
  },
});
