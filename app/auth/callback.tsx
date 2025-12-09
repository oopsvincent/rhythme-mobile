import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { router, useRootNavigationState } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL that opened the app
        const url = await Linking.getInitialURL();
        console.log("OAuth callback URL:", url);

        if (url) {
          let accessToken: string | null = null;
          let refreshToken: string | null = null;

          // Try hash fragment first (standard OAuth)
          if (url.includes("#")) {
            const hashPart = url.split("#")[1];
            const params = new URLSearchParams(hashPart);
            accessToken = params.get("access_token");
            refreshToken = params.get("refresh_token");
          }

          // Fallback to query params
          if (!accessToken && url.includes("?")) {
            const queryPart = url.split("?")[1]?.split("#")[0];
            if (queryPart) {
              const params = new URLSearchParams(queryPart);
              accessToken = params.get("access_token");
              refreshToken = params.get("refresh_token");
            }
          }

          if (accessToken && refreshToken) {
            console.log("Setting session with tokens...");
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error("Session error:", sessionError);
              setError(sessionError.message);
            } else {
              console.log("Session set successfully, redirecting to dashboard...");
              // Wait for navigation to be ready
              if (navigationState?.key) {
                router.replace("/(tabs)");
              }
            }
          } else {
            // No tokens in URL, check if already authenticated
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              console.log("Already authenticated, redirecting...");
              if (navigationState?.key) {
                router.replace("/(tabs)");
              }
            } else {
              console.log("No tokens found in URL");
              setError("Authentication failed. Please try again.");
            }
          }
        } else {
          // No URL, check existing session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            if (navigationState?.key) {
              router.replace("/(tabs)");
            }
          } else {
            setError("No authentication data found.");
          }
        }
      } catch (e) {
        console.error("Callback error:", e);
        setError("An error occurred during authentication.");
      } finally {
        setProcessing(false);
      }
    };

    if (navigationState?.key) {
      handleCallback();
    }
  }, [navigationState?.key]);

  // Show loading while processing
  if (processing) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className="text-foreground mt-4 text-lg">Signing you in...</Text>
      </View>
    );
  }

  // Show error if any
  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-error text-lg text-center mb-4">{error}</Text>
        <Text
          className="text-primary text-base"
          onPress={() => router.replace("/(auth)/login")}
        >
          Go to Login
        </Text>
      </View>
    );
  }

  // Redirecting...
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text className="text-foreground mt-4 text-lg">Redirecting...</Text>
    </View>
  );
}
