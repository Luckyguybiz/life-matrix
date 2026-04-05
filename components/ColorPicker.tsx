import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#ef4444",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

interface Props {
  selected: string;
  onSelect: (color: string) => void;
}

export default function ColorPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[styles.circle, { backgroundColor: color }]}
          onPress={() => onSelect(color)}
        >
          {selected === color && (
            <Ionicons name="checkmark" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
