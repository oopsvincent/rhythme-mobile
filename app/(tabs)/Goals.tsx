import { Button } from "@/components/ui";
import { GoalStorage, LongTermGoal } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import {
    BarChart3,
    Calendar,
    Edit3,
    GitBranch,
    List,
    Sparkles,
    Target,
    TrendingUp
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function GoalsScreen() {
  const [goal, setGoal] = useState<LongTermGoal | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"graph" | "list">("list");

  const loadData = useCallback(async () => {
    const goalData = await GoalStorage.get();
    setGoal(goalData);
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

  if (!goal) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <View
          className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
          style={{ backgroundColor: "rgba(255,107,53,0.15)" }}
        >
          <Target size={48} color="#FF6B35" />
        </View>
        <Text className="text-foreground text-2xl font-bold text-center mb-2">
          No Goal Set
        </Text>
        <Text className="text-foreground/50 text-center mb-6">
          Define your long-term goal to get started
        </Text>
        <Button onPress={() => router.push("/onboarding/goal")}>
          Set Your Goal
        </Button>
      </View>
    );
  }

  const daysRemaining = GoalStorage.getDaysRemaining(goal);
  const progressPercent = goal.progress;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 pb-32"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
      }
    >
      {/* Goal Header Card */}
      <View
        className="rounded-3xl p-6 mb-6"
        style={{
          backgroundColor: "rgba(255,107,53,0.1)",
          borderWidth: 2,
          borderColor: "rgba(255,107,53,0.25)",
        }}
      >
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Target size={20} color="#FF6B35" />
              <Text className="text-primary text-sm font-semibold ml-2 uppercase tracking-wide">
                Your Goal
              </Text>
            </View>
            <Text className="text-foreground text-2xl font-bold">{goal.title}</Text>
            {goal.description && (
              <Text className="text-foreground/60 mt-2">{goal.description}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // TODO: Edit goal
            }}
            className="p-2 rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Edit3 size={18} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-foreground/60">Progress</Text>
            <Text className="text-primary font-bold">{progressPercent}%</Text>
          </View>
          <View
            className="h-4 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "#FF6B35",
              }}
            />
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-4">
          <View className="flex-1 items-center p-3 rounded-xl" style={{ backgroundColor: "rgba(0,217,255,0.1)" }}>
            <Calendar size={18} color="#00D9FF" />
            <Text className="text-accent font-bold text-lg mt-1">{daysRemaining}</Text>
            <Text className="text-foreground/50 text-xs">days left</Text>
          </View>
          <View className="flex-1 items-center p-3 rounded-xl" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
            <TrendingUp size={18} color="#22C55E" />
            <Text className="text-success font-bold text-lg mt-1">0</Text>
            <Text className="text-foreground/50 text-xs">sub-goals</Text>
          </View>
          <View className="flex-1 items-center p-3 rounded-xl" style={{ backgroundColor: "rgba(255,107,53,0.1)" }}>
            <BarChart3 size={18} color="#FF6B35" />
            <Text className="text-primary font-bold text-lg mt-1">0</Text>
            <Text className="text-foreground/50 text-xs">tasks done</Text>
          </View>
        </View>
      </View>

      {/* View Toggle */}
      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode("list");
          }}
          className="flex-1 flex-row items-center justify-center py-3 rounded-xl mr-2"
          style={{
            backgroundColor: viewMode === "list" ? "#FF6B35" : "rgba(255,255,255,0.05)",
          }}
        >
          <List size={18} color={viewMode === "list" ? "#FFFFFF" : "#71717A"} />
          <Text
            className="ml-2 font-semibold"
            style={{ color: viewMode === "list" ? "#FFFFFF" : "#71717A" }}
          >
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode("graph");
          }}
          className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
          style={{
            backgroundColor: viewMode === "graph" ? "#FF6B35" : "rgba(255,255,255,0.05)",
          }}
        >
          <GitBranch size={18} color={viewMode === "graph" ? "#FFFFFF" : "#71717A"} />
          <Text
            className="ml-2 font-semibold"
            style={{ color: viewMode === "graph" ? "#FFFFFF" : "#71717A" }}
          >
            Graph
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-Goals Section - Empty State */}
      <View
        className="rounded-2xl p-6 items-center"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          borderStyle: "dashed",
        }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(0,217,255,0.15)" }}
        >
          <Sparkles size={32} color="#00D9FF" />
        </View>
        <Text className="text-foreground text-lg font-semibold mb-2">
          No Sub-Goals Yet
        </Text>
        <Text className="text-foreground/50 text-center mb-4">
          Break your goal into smaller milestones to track progress
        </Text>
        <Button
          variant="secondary"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          Add Sub-Goal
        </Button>
      </View>

      {/* Coming Soon: Graph View */}
      {viewMode === "graph" && (
        <View
          className="mt-4 rounded-2xl p-6 items-center"
          style={{
            backgroundColor: "rgba(255,107,53,0.05)",
            borderWidth: 1,
            borderColor: "rgba(255,107,53,0.15)",
          }}
        >
          <GitBranch size={32} color="#FF6B35" />
          <Text className="text-primary font-semibold mt-3">Graph View</Text>
          <Text className="text-foreground/50 text-sm text-center mt-1">
            Visualize your sub-goals as connected nodes. Coming in Phase 2!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}