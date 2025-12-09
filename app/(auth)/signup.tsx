import { useAuth } from "@/context/AuthProvider";
import { Provider } from "@supabase/supabase-js";
import { Link } from "expo-router";
import {
    Apple,
    Chrome,
    Eye,
    EyeOff,
    Facebook,
    Github,
    Lock,
    Mail,
    MessageCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const OAUTH_PROVIDERS: {
  id: Provider | "apple";
  name: string;
  icon: React.ReactNode;
  disabled?: boolean;
  bgColor: string;
  textColor: string;
}[] = [
  {
    id: "google",
    name: "Google",
    icon: <Chrome size={20} color="#fff" />,
    bgColor: "#4285F4",
    textColor: "#fff",
  },
  {
    id: "apple",
    name: "Apple",
    icon: <Apple size={20} color="#666" />,
    disabled: true,
    bgColor: "#E5E5E5",
    textColor: "#666",
  },
  {
    id: "github",
    name: "GitHub",
    icon: <Github size={20} color="#fff" />,
    bgColor: "#333",
    textColor: "#fff",
  },
  {
    id: "discord",
    name: "Discord",
    icon: <MessageCircle size={20} color="#fff" />,
    bgColor: "#5865F2",
    textColor: "#fff",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <Facebook size={20} color="#fff" />,
    bgColor: "#1877F2",
    textColor: "#fff",
  },
];

export default function SignUpScreen() {
  const { signUpWithEmail, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await signUpWithEmail(email, password);

    if (error) {
      setError(getErrorMessage(error.message));
    } else {
      setSuccess(true);
    }

    setIsLoading(false);
  };

  const handleOAuthSignUp = async (provider: Provider) => {
    setOauthLoading(provider);
    setError(null);

    const { error } = await signInWithOAuth(provider);

    if (error) {
      setError(getErrorMessage(error.message));
    }

    setOauthLoading(null);
  };

  const getErrorMessage = (message: string): string => {
    if (message.includes("User already registered")) {
      return "An account with this email already exists.";
    }
    if (message.includes("Invalid email")) {
      return "Please enter a valid email address.";
    }
    if (message.includes("Password should be")) {
      return "Password must be at least 6 characters.";
    }
    if (message.includes("Too many requests")) {
      return "Too many attempts. Please try again later.";
    }
    if (message.includes("Network")) {
      return "Network error. Please check your connection.";
    }
    return message;
  };

  if (success) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <View className="bg-green-50 border border-green-200 rounded-2xl p-8 items-center">
          <Text className="text-2xl font-bold text-green-700 mb-4">
            Check Your Email
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            We've sent a verification link to{"\n"}
            <Text className="font-semibold text-gray-900">{email}</Text>
          </Text>
          <Text className="text-gray-500 text-center text-sm mb-6">
            Please click the link in the email to verify your account, then
            return here to sign in.
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="bg-orange-500 rounded-xl py-4 px-8">
              <Text className="text-white font-semibold text-lg">
                Go to Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header */}
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              Create Account
            </Text>
            <Text className="text-lg text-gray-500">
              Join Rhythmé and start your journey
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
              <Mail size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-900"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Password
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-900"
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 py-4 px-3 text-gray-900"
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleEmailSignUp}
            disabled={isLoading}
            className="bg-orange-500 rounded-xl py-4 mb-6"
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-gray-500">or sign up with</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          {/* OAuth Buttons */}
          <View className="gap-3 mb-8">
            {OAUTH_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                onPress={() =>
                  !provider.disabled && handleOAuthSignUp(provider.id as Provider)
                }
                disabled={provider.disabled || oauthLoading !== null}
                className="flex-row items-center justify-center rounded-xl py-4 px-4"
                style={{
                  backgroundColor: provider.bgColor,
                  opacity: provider.disabled || oauthLoading ? 0.6 : 1,
                }}
              >
                {oauthLoading === provider.id ? (
                  <ActivityIndicator color={provider.textColor} />
                ) : (
                  <>
                    {provider.icon}
                    <Text
                      className="ml-3 font-semibold text-base"
                      style={{ color: provider.textColor }}
                    >
                      {provider.disabled
                        ? `${provider.name} (Coming Soon)`
                        : `Continue with ${provider.name}`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-orange-500 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
