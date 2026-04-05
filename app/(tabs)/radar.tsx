import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { fetchSpheres, type Sphere } from "../../lib/api";
import RadarChart from "../../components/RadarChart";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function RadarScreen() {
  const [spheres, setSpheres] = useState<Sphere[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  async function loadSpheres() {
    try {
      const data = await fetchSpheres();
      setSpheres(data);
    } catch {
      // silent
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadSpheres().finally(() => setLoading(false));
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadSpheres();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (spheres.length < 3) {
    return (
      <View style={styles.center}>
        <Ionicons name="radio-outline" size={48} color="#444" />
        <Text style={styles.emptyTitle}>
          Нужно минимум 3 сферы для радара
        </Text>
        <Text style={styles.emptySubtitle}>
          Сейчас: {spheres.length}. Добавьте ещё в Матрице.
        </Text>
      </View>
    );
  }

  const chartSize = Math.min(SCREEN_WIDTH - 32, 360);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      <RadarChart spheres={spheres} size={chartSize} />

      <View style={styles.legend}>
        {spheres.map((sphere) => (
          <TouchableOpacity
            key={sphere.id}
            style={styles.legendItem}
            onPress={() => router.push(`/sphere/${sphere.id}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: sphere.color }]} />
            <View style={styles.legendInfo}>
              <Text style={styles.legendName}>{sphere.name}</Text>
              <Text style={styles.legendValue}>
                {sphere.current_level} / {sphere.target_level}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#555" />
          </TouchableOpacity>
        ))}
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
    alignItems: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  legend: {
    width: "100%",
    marginTop: 24,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  legendValue: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
});
