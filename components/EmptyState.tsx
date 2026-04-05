import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  onPress?: () => void;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  buttonText,
  onPress,
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={48}
        color="#444"
      />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {buttonText && onPress && (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
});
