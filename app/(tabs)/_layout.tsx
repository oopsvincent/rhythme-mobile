import { BottomAppBar } from "@/components/navigation/BottomAppBar";
import { useAuth } from "@/context/AuthProvider";
import { router, Slot, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const [activeRoute, setActiveRoute] = useState("index");

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [user, isLoading, segments]);

  useEffect(() => {
    // Get current route from segments
    if (segments.length > 1) {
      setActiveRoute(segments[1]);
    } else {
      setActiveRoute("index");
    }
  }, [segments]);

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View className="flex-1 bg-background">
          {/* Main Content with SafeArea */}
          <SafeAreaView className="flex-1" edges={["top"]}>
            <View className="flex-1 pb-24">
              <Slot />
            </View>
          </SafeAreaView>

          {/* Bottom App Bar (handles its own safe area) */}
          <BottomAppBar
            activeRoute={activeRoute}
            onNavigate={handleNavigate}
          />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
