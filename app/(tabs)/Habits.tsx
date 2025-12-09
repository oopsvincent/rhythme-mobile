import { Button } from "@/components/ui";
import { GoalStorage, LongTermGoal } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import {
    Calendar,
    Check,
    Flame,
    Plus,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

export default function HabitsScreen() {
  const [goal, setGoal] = useState<LongTermGoal | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Get week days
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" })[0],
        date: date.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 pb-32"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
      }
    >
      {/* Goal Link */}
      {goal && (
        <View
          className="rounded-2xl p-4 mb-6 flex-row items-center"
          style={{
            backgroundColor: "rgba(255,107,53,0.08)",
            borderWidth: 1,
            borderColor: "rgba(255,107,53,0.15)",
          }}
        >
          <Target size={20} color="#FF6B35" />
          <Text className="text-foreground/70 ml-3 flex-1" numberOfLines={1}>
            Habits for: <Text className="text-foreground font-semibold">{goal.title}</Text>
          </Text>
        </View>
      )}

      {/* Week Overview */}
      <View
        className="rounded-2xl p-4 mb-6"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <View className="flex-row items-center mb-4">
          <Calendar size={18} color="#00D9FF" />
          <Text className="text-foreground font-semibold ml-2">This Week</Text>
        </View>
        <View className="flex-row justify-between">
          {weekDays.map((day, i) => (
            <View key={i} className="items-center">
              <Text className="text-foreground/50 text-xs mb-2">{day.day}</Text>
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: day.isToday ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.05)",
                  borderWidth: day.isToday ? 2 : 0,
                  borderColor: "#FF6B35",
                }}
              >
                <Text
                  className="font-bold"
                  style={{ color: day.isToday ? "#FF6B35" : "rgba(255,255,255,0.5)" }}
                >
                  {day.date}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row gap-3 mb-6">
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: "rgba(255,107,53,0.1)" }}
        >
          <Flame size={24} color="#FF6B35" />
          <Text className="text-primary text-3xl font-bold mt-2">0</Text>
          <Text className="text-foreground/50 text-sm">day streak</Text>
        </View>
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
        >
          <Check size={24} color="#22C55E" />
          <Text className="text-success text-3xl font-bold mt-2">0</Text>
          <Text className="text-foreground/50 text-sm">completed</Text>
        </View>
        <View
          className="flex-1 rounded-2xl p-4 items-center"
          style={{ backgroundColor: "rgba(0,217,255,0.1)" }}
        >
          <TrendingUp size={24} color="#00D9FF" />
          <Text className="text-accent text-3xl font-bold mt-2">0%</Text>
          <Text className="text-foreground/50 text-sm">rate</Text>
        </View>
      </View>

      {/* Empty State */}
      <View
        className="rounded-2xl p-8 items-center"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          borderStyle: "dashed",
        }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(255,107,53,0.15)" }}
        >
          <Sparkles size={32} color="#FF6B35" />
        </View>
        <Text className="text-foreground text-lg font-semibold mb-2">
          No Habits Yet
        </Text>
        <Text className="text-foreground/50 text-center mb-6">
          Build daily habits that align with your goal
        </Text>
        <Button
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          icon={<Plus size={18} color="#FFFFFF" />}
        >
          Create Habit
        </Button>
      </View>

      {/* Info */}
      <View
        className="mt-6 rounded-2xl p-4"
        style={{
          backgroundColor: "rgba(0,217,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(0,217,255,0.1)",
        }}
      >
        <Text className="text-accent text-sm font-semibold mb-2">💡 Tip</Text>
        <Text className="text-foreground/70 text-sm">
          Start with 1-3 small habits that support your goal. Consistency beats intensity!
        </Text>
      </View>
    </ScrollView>
  );
}