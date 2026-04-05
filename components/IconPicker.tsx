import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ICONS = [
  "briefcase-outline",
  "fitness-outline",
  "wallet-outline",
  "school-outline",
  "heart-outline",
  "people-outline",
  "globe-outline",
  "rocket-outline",
  "musical-notes-outline",
  "book-outline",
  "car-outline",
  "home-outline",
];

interface Props {
  selected: string;
  color: string;
  onSelect: (icon: string) => void;
}

export default function IconPicker({ selected, color, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {ICONS.map((icon) => (
        <TouchableOpacity
          key={icon}
          style={[
            styles.item,
            selected === icon && { backgroundColor: color + "20", borderColor: color },
          ]}
          onPress={() => onSelect(icon)}
        >
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={selected === icon ? color : "#888"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
});
