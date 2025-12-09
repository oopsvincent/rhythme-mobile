import { Button } from "@/components/ui";
import { GoalStorage } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ArrowRight, Calendar, CheckCircle2, Sparkles, Target } from "lucide-react-native";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const timelineOptions = [
  { label: "3 months", value: 90 },
  { label: "6 months", value: 180 },
  { label: "1 year", value: 365 },
  { label: "2 years", value: 730 },
];

export default function GoalOnboardingScreen() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const canProceed = step === 1 ? title.trim().length > 0 : selectedTimeline !== null;

  const handleNext = () => {
    if (step === 1 && title.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !selectedTimeline) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + selectedTimeline);

    await GoalStorage.create({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate.toISOString(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-6 pb-20"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center mb-8 pt-8">
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
              style={{
                backgroundColor: "rgba(255,107,53,0.15)",
                borderWidth: 2,
                borderColor: "rgba(255,107,53,0.3)",
              }}
            >
              <Target size={40} color="#FF6B35" />
            </View>
            <Text className="text-foreground text-2xl font-bold text-center">
              Define Your Goal
            </Text>
            <Text className="text-foreground/50 text-center mt-2 px-4">
              Everything in Rhythmé will work towards this ONE long-term goal
            </Text>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row items-center justify-center mb-8">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: step >= 1 ? "#FF6B35" : "rgba(255,255,255,0.1)",
              }}
            >
              {step > 1 ? (
                <CheckCircle2 size={20} color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold">1</Text>
              )}
            </View>
            <View
              className="w-16 h-1 mx-2"
              style={{
                backgroundColor: step >= 2 ? "#FF6B35" : "rgba(255,255,255,0.1)",
              }}
            />
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: step >= 2 ? "#FF6B35" : "rgba(255,255,255,0.1)",
              }}
            >
              <Text
                className="font-bold"
                style={{ color: step >= 2 ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}
              >
                2
              </Text>
            </View>
          </View>

          {step === 1 && (
            <>
              {/* Goal Title */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Sparkles size={16} color="#FF6B35" />
                  <Text className="text-primary text-sm font-semibold ml-2">
                    WHAT'S YOUR GOAL?
                  </Text>
                </View>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Learn Spanish fluently"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  className="bg-surface border-2 border-primary/20 rounded-2xl px-4 py-4 text-foreground text-lg"
                  autoFocus
                />
              </View>

              {/* Goal Description */}
              <View className="mb-8">
                <View className="flex-row items-center mb-2">
                  <Text className="text-foreground/70 text-sm font-semibold">
                    WHY IS THIS IMPORTANT? (OPTIONAL)
                  </Text>
                </View>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Your motivation and why this matters..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  className="bg-surface border-2 border-surface-border rounded-2xl px-4 py-4 text-foreground"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Examples */}
              <View
                className="rounded-2xl p-4 mb-8"
                style={{
                  backgroundColor: "rgba(0,217,255,0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(0,217,255,0.15)",
                }}
              >
                <Text className="text-accent text-sm font-semibold mb-3">
                  EXAMPLE GOALS
                </Text>
                {[
                  "Run a marathon",
                  "Launch my startup",
                  "Get promoted to senior developer",
                  "Write and publish a book",
                ].map((example, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTitle(example);
                    }}
                    className="py-2"
                  >
                    <Text className="text-foreground/70">• {example}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              {/* Goal Summary */}
              <View
                className="rounded-2xl p-4 mb-6"
                style={{
                  backgroundColor: "rgba(255,107,53,0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(255,107,53,0.2)",
                }}
              >
                <Text className="text-foreground/50 text-sm mb-1">YOUR GOAL</Text>
                <Text className="text-foreground text-xl font-bold">{title}</Text>
                {description && (
                  <Text className="text-foreground/60 mt-2">{description}</Text>
                )}
              </View>

              {/* Timeline Selection */}
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <Calendar size={16} color="#00D9FF" />
                  <Text className="text-accent text-sm font-semibold ml-2">
                    WHEN DO YOU WANT TO ACHIEVE THIS?
                  </Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                  {timelineOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedTimeline(option.value);
                      }}
                      className="flex-1 min-w-[45%] py-4 px-4 rounded-2xl items-center"
                      style={{
                        backgroundColor:
                          selectedTimeline === option.value
                            ? "rgba(255,107,53,0.2)"
                            : "rgba(255,255,255,0.05)",
                        borderWidth: 2,
                        borderColor:
                          selectedTimeline === option.value
                            ? "#FF6B35"
                            : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text
                        className="font-bold text-lg"
                        style={{
                          color:
                            selectedTimeline === option.value
                              ? "#FF6B35"
                              : "rgba(255,255,255,0.7)",
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Motivational Note */}
              <View
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: "rgba(34,197,94,0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(34,197,94,0.15)",
                }}
              >
                <Text className="text-success text-sm font-semibold mb-2">
                  🚀 YOU GOT THIS!
                </Text>
                <Text className="text-foreground/70 text-sm">
                  We'll break this down into tasks, habits, and focus sessions.
                  Every action you take will move you closer to your goal.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View className="p-6 bg-background border-t border-surface-border">
          {step === 1 ? (
            <Button
              onPress={handleNext}
              disabled={!canProceed}
              size="lg"
              icon={<ArrowRight size={20} color="#FFFFFF" />}
            >
              Continue
            </Button>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setStep(1)}
                className="py-4 px-6 rounded-2xl bg-surface"
              >
                <Text className="text-foreground font-semibold">Back</Text>
              </TouchableOpacity>
              <View className="flex-1">
                <Button
                  onPress={handleCreate}
                  disabled={!canProceed}
                  loading={loading}
                  size="lg"
                  icon={<Target size={20} color="#FFFFFF" />}
                >
                  Start Journey
                </Button>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
