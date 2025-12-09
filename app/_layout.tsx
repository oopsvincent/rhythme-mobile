import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { GoalStorage } from "@/lib/storage";
import { Stack, router, usePathname, useSegments } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "./globals.css";

function RootLayoutNav() {
  const { user, isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const [hasGoal, setHasGoal] = useState<boolean | null>(null);
  const [checkingGoal, setCheckingGoal] = useState(true);

  // Check if user has a goal - recheck on pathname change
  const checkGoal = useCallback(async () => {
    if (!user) {
      setHasGoal(null);
      setCheckingGoal(false);
      return;
    }

    const goalExists = await GoalStorage.hasGoal();
    setHasGoal(goalExists);
    setCheckingGoal(false);
  }, [user]);

  // Initial check and recheck on pathname changes
  useEffect(() => {
    if (!authLoading) {
      checkGoal();
    }
  }, [user, authLoading, pathname, checkGoal]);

  useEffect(() => {
    if (authLoading || checkingGoal) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAuthCallback = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    // Skip redirect for OAuth callback
    if (inAuthCallback) return;

    if (!user && !inAuthGroup) {
      // Not authenticated - go to login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Authenticated but in auth group - check goal
      if (hasGoal) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding/goal");
      }
    } else if (user && hasGoal === false && !inOnboarding) {
      // Authenticated but no goal - go to onboarding
      router.replace("/onboarding/goal");
    } else if (user && hasGoal === true && inOnboarding) {
      // Has goal but still in onboarding - go to tabs
      router.replace("/(tabs)");
    }
  }, [user, authLoading, checkingGoal, hasGoal, segments]);

  if (authLoading || checkingGoal) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="tasks"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
