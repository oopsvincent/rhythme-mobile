import { GoalStorage, LongTermGoal } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import {
    Brain,
    Clock,
    Coffee,
    Pause,
    Play,
    RotateCcw,
    Settings,
    Target,
    Zap
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, Vibration, View } from "react-native";

type SessionType = "focus" | "short_break" | "long_break";

interface SessionConfig {
  type: SessionType;
  label: string;
  duration: number; // in seconds
  color: string;
  icon: React.ReactNode;
}

const sessionConfigs: SessionConfig[] = [
  { type: "focus", label: "Focus", duration: 25 * 60, color: "#FF6B35", icon: <Brain size={20} /> },
  { type: "short_break", label: "Break", duration: 5 * 60, color: "#22C55E", icon: <Coffee size={20} /> },
  { type: "long_break", label: "Long Break", duration: 15 * 60, color: "#00D9FF", icon: <Zap size={20} /> },
];

const presets = [
  { label: "Quick Focus", duration: 15 * 60, color: "#22C55E" },
  { label: "Pomodoro", duration: 25 * 60, color: "#FF6B35" },
  { label: "Deep Work", duration: 45 * 60, color: "#00D9FF" },
  { label: "Flow State", duration: 90 * 60, color: "#8B5CF6" },
];

export default function FocusScreen() {
  const [goal, setGoal] = useState<LongTermGoal | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSession = sessionConfigs.find((s) => s.type === sessionType)!;

  const loadData = useCallback(async () => {
    const goalData = await GoalStorage.get();
    setGoal(goalData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer completed
      setIsRunning(false);
      Vibration.vibrate([0, 500, 200, 500]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (sessionType === "focus") {
        setSessionsCompleted((prev) => prev + 1);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, sessionType]);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setTimeLeft(currentSession.duration);
  };

  const selectSession = (type: SessionType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const session = sessionConfigs.find((s) => s.type === type)!;
    setSessionType(type);
    setTimeLeft(session.duration);
    setIsRunning(false);
  };

  const selectPreset = (duration: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeLeft(duration);
    setIsRunning(false);
  };

  const progress = 1 - timeLeft / currentSession.duration;

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
            Focusing on: <Text className="text-foreground font-semibold">{goal.title}</Text>
          </Text>
        </View>
      )}

      {/* Session Type Selector */}
      <View className="flex-row gap-2 mb-6">
        {sessionConfigs.map((session) => (
          <TouchableOpacity
            key={session.type}
            onPress={() => selectSession(session.type)}
            className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
            style={{
              backgroundColor:
                sessionType === session.type ? `${session.color}20` : "rgba(255,255,255,0.05)",
              borderWidth: 2,
              borderColor: sessionType === session.type ? session.color : "transparent",
            }}
          >
            {React.cloneElement(session.icon as React.ReactElement, {
              color: sessionType === session.type ? session.color : "#71717A",
            })}
            <Text
              className="ml-2 font-semibold"
              style={{ color: sessionType === session.type ? session.color : "#71717A" }}
            >
              {session.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer Display */}
      <View
        className="rounded-3xl p-8 items-center mb-6"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          borderWidth: 2,
          borderColor: `${currentSession.color}30`,
        }}
      >
        {/* Circle Progress */}
        <View className="relative items-center justify-center mb-6">
          <View
            className="w-48 h-48 rounded-full items-center justify-center"
            style={{
              backgroundColor: `${currentSession.color}10`,
              borderWidth: 6,
              borderColor: `${currentSession.color}30`,
            }}
          >
            <Text
              className="text-5xl font-bold"
              style={{ color: currentSession.color }}
            >
              {formatTime(timeLeft)}
            </Text>
            <Text className="text-foreground/50 mt-1">{currentSession.label}</Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={resetTimer}
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <RotateCcw size={24} color="#71717A" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTimer}
            className="w-20 h-20 rounded-3xl items-center justify-center"
            style={{
              backgroundColor: currentSession.color,
              shadowColor: currentSession.color,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {isRunning ? (
              <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Settings size={24} color="#71717A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Presets */}
      <Text className="text-foreground font-semibold mb-3">Quick Presets</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {presets.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            onPress={() => selectPreset(preset.duration)}
            className="py-2 px-4 rounded-xl"
            style={{
              backgroundColor: `${preset.color}15`,
              borderWidth: 1,
              borderColor: `${preset.color}30`,
            }}
          >
            <Text style={{ color: preset.color }} className="font-medium">
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Session Stats */}
      <View
        className="rounded-2xl p-4 flex-row items-center"
        style={{
          backgroundColor: "rgba(255,107,53,0.08)",
          borderWidth: 1,
          borderColor: "rgba(255,107,53,0.15)",
        }}
      >
        <Clock size={20} color="#FF6B35" />
        <Text className="text-foreground ml-3">
          <Text className="font-bold text-primary">{sessionsCompleted}</Text> focus sessions today
        </Text>
      </View>
    </ScrollView>
  );
}