import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProgressBar from "./ProgressBar";
import type { Sphere } from "../lib/api";

interface Props {
  sphere: Sphere;
  onPress: () => void;
}

export default function SphereCard({ sphere, onPress }: Props) {
  const progressPercent =
    sphere.target_level > 0
      ? (sphere.current_level / sphere.target_level) * 100
      : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: sphere.color + "20" }]}>
          <Ionicons
            name={sphere.icon as keyof typeof Ionicons.glyphMap}
            size={22}
            color={sphere.color}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{sphere.name}</Text>
          <Text style={styles.level}>
            {sphere.current_level} / {sphere.target_level}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#555" />
      </View>
      <ProgressBar progress={progressPercent} color={sphere.color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  level: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
});
