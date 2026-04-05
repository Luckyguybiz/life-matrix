import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Milestone } from "../lib/api";

interface Props {
  milestone: Milestone;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export default function MilestoneItem({ milestone, onToggle, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(milestone.id, !milestone.is_completed)}
      >
        <Ionicons
          name={
            milestone.is_completed
              ? "checkmark-circle"
              : "ellipse-outline"
          }
          size={24}
          color={milestone.is_completed ? "#4ade80" : "#555"}
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.title,
          milestone.is_completed && styles.titleCompleted,
        ]}
        numberOfLines={2}
      >
        {milestone.title}
      </Text>
      <TouchableOpacity
        onPress={() => onDelete(milestone.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close-circle-outline" size={20} color="#555" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  checkbox: {
    padding: 2,
  },
  title: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  titleCompleted: {
    color: "#666",
    textDecorationLine: "line-through",
  },
});
