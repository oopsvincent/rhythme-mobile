import { useAuth } from "@/context/AuthProvider";
import { GoalStorage, LongTermGoal, TaskStats, TaskStorage } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    Flame,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function DashboardScreen() {
  const { user } = useAuth();
  const [goal, setGoal] = useState<LongTermGoal | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [goalData, stats] = await Promise.all([
      GoalStorage.get(),
      TaskStorage.getStats(),
    ]);
    setGoal(goalData);
    setTaskStats(stats);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 pb-32"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
      }
    >
      {/* Header */}
      <View className="mb-6">
        <Text className="text-foreground/60 text-base">{getGreeting()},</Text>
        <View className="flex-row items-center">
          <Text className="text-foreground text-2xl font-bold">{firstName}</Text>
          <Sparkles size={20} color="#FF6B35" style={{ marginLeft: 8 }} />
        </View>
      </View>

      {/* Goal Card */}
      {goal && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/Goals");
          }}
          activeOpacity={0.8}
        >
          <View
            className="rounded-3xl p-5 mb-6"
            style={{
              backgroundColor: "rgba(255,107,53,0.1)",
              borderWidth: 2,
              borderColor: "rgba(255,107,53,0.25)",
            }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: "#FF6B35" }}
              >
                <Target size={24} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-foreground/50 text-xs uppercase tracking-wide">
                  YOUR GOAL
                </Text>
                <Text className="text-foreground text-lg font-bold" numberOfLines={1}>
                  {goal.title}
                </Text>
              </View>
              <ArrowRight size={20} color="#FF6B35" />
            </View>

            {/* Progress Bar */}
            <View className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-foreground/60 text-sm">Progress</Text>
                <Text className="text-primary font-bold">{goal.progress}%</Text>
              </View>
              <View
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: "#FF6B35",
                  }}
                />
              </View>
            </View>

            {/* Days Remaining */}
            <View className="flex-row items-center">
              <Calendar size={14} color="#00D9FF" />
              <Text className="text-accent text-sm ml-2">
                {GoalStorage.getDaysRemaining(goal)} days remaining
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Stats */}
      <View className="flex-row gap-3 mb-6">
        <View
          className="flex-1 rounded-2xl p-4"
          style={{
            backgroundColor: "rgba(34,197,94,0.1)",
            borderWidth: 1,
            borderColor: "rgba(34,197,94,0.2)",
          }}
        >
          <CheckCircle2 size={20} color="#22C55E" />
          <Text className="text-3xl font-bold text-success mt-2">
            {taskStats?.completedToday || 0}
          </Text>
          <Text className="text-foreground/50 text-sm">Done Today</Text>
        </View>

        <View
          className="flex-1 rounded-2xl p-4"
          style={{
            backgroundColor: "rgba(0,217,255,0.1)",
            borderWidth: 1,
            borderColor: "rgba(0,217,255,0.2)",
          }}
        >
          <Clock size={20} color="#00D9FF" />
          <Text className="text-3xl font-bold text-accent mt-2">
            {taskStats?.pending || 0}
          </Text>
          <Text className="text-foreground/50 text-sm">Pending</Text>
        </View>

        <View
          className="flex-1 rounded-2xl p-4"
          style={{
            backgroundColor: "rgba(255,107,53,0.1)",
            borderWidth: 1,
            borderColor: "rgba(255,107,53,0.2)",
          }}
        >
          <Flame size={20} color="#FF6B35" />
          <Text className="text-3xl font-bold text-primary mt-2">0</Text>
          <Text className="text-foreground/50 text-sm">Streak</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text className="text-foreground text-lg font-bold mb-3">Quick Actions</Text>
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/Tasks");
          }}
          activeOpacity={0.7}
          className="flex-1 rounded-2xl p-4 items-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: "rgba(255,107,53,0.15)" }}
          >
            <TrendingUp size={24} color="#FF6B35" />
          </View>
          <Text className="text-foreground font-medium">Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/Focus");
          }}
          activeOpacity={0.7}
          className="flex-1 rounded-2xl p-4 items-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: "rgba(0,217,255,0.15)" }}
          >
            <Clock size={24} color="#00D9FF" />
          </View>
          <Text className="text-foreground font-medium">Focus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/Journal");
          }}
          activeOpacity={0.7}
          className="flex-1 rounded-2xl p-4 items-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
          >
            <Sparkles size={24} color="#22C55E" />
          </View>
          <Text className="text-foreground font-medium">Journal</Text>
        </TouchableOpacity>
      </View>

      {/* Motivation */}
      <View
        className="rounded-2xl p-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <Text className="text-foreground/50 text-sm text-center italic">
          "Every action you take is a step toward your goal."
        </Text>
      </View>
    </ScrollView>
  );
}
