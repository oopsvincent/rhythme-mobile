import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function AuthCallbackScreen() {
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the OAuth callback
        const accessToken = params.access_token as string;
        const refreshToken = params.refresh_token as string;

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setError(error.message);
            return;
          }

          // Redirect to dashboard on success
          router.replace("/(tabs)");
        } else {
          // If no tokens, check if we have an error
          const errorDescription = params.error_description as string;
          if (errorDescription) {
            setError(errorDescription);
          } else {
            // Try to get the current session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              router.replace("/(tabs)");
            } else {
              setError("Authentication failed. Please try again.");
            }
          }
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      }
    };

    handleCallback();
  }, [params]);

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <View className="bg-red-50 border border-red-200 rounded-2xl p-8 items-center">
          <Text className="text-xl font-bold text-red-700 mb-4">
            Authentication Error
          </Text>
          <Text className="text-gray-600 text-center mb-6">{error}</Text>
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            className="bg-orange-500 rounded-xl py-4 px-8"
          >
            <Text className="text-white font-semibold text-lg">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text className="text-gray-500 mt-4">Completing sign in...</Text>
    </View>
  );
}
