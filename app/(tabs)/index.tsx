import { useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchSpheres, type Sphere } from "../../lib/api";
import SphereCard from "../../components/SphereCard";
import EmptyState from "../../components/EmptyState";

export default function MatrixScreen() {
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

  return (
    <View style={styles.container}>
      <FlatList
        data={spheres}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SphereCard
            sphere={item}
            onPress={() => router.push(`/sphere/${item.id}`)}
          />
        )}
        contentContainerStyle={
          spheres.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="layers-outline"
            title="Нет сфер"
            subtitle="Добавьте первую сферу жизни"
            buttonText="Добавить сферу"
            onPress={() => router.push("/sphere/new")}
          />
        }
      />

      {spheres.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/sphere/new")}
        >
          <Ionicons name="add" size={28} color="#000" />
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
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
