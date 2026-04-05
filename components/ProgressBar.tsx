import { View, Text, StyleSheet } from "react-native";

interface Props {
  progress: number;
  color: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  color,
  height = 8,
  showLabel = true,
}: Props) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showLabel && <Text style={styles.label}>{Math.round(clamped)}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  track: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 4,
  },
  label: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
});
