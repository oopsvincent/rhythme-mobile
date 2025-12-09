import { Button } from "@/components/ui";
import * as Haptics from "expo-haptics";
import { Bot, Calendar, Lightbulb, MessageSquare, Sparkles, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AIScreen() {
  const suggestions = [
    { icon: <Lightbulb size={18} color="#F59E0B" />, text: "Help me plan my day" },
    { icon: <Calendar size={18} color="#00D9FF" />, text: "Review my week" },
    { icon: <Zap size={18} color="#22C55E" />, text: "Boost my productivity" },
  ];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4">
      {/* Header */}
      <View className="items-center mb-8 pt-4">
        <View 
          className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
          style={{ 
            backgroundColor: "rgba(0,217,255,0.15)",
            borderWidth: 2,
            borderColor: "rgba(0,217,255,0.3)",
          }}
        >
          <Bot size={48} color="#00D9FF" />
        </View>
        <View className="flex-row items-center">
          <Text className="text-foreground text-2xl font-bold">Rhythmé AI</Text>
          <Sparkles size={20} color="#FF6B35" style={{ marginLeft: 8 }} />
        </View>
        <Text className="text-foreground/50 text-center mt-2 px-4">
          Your intelligent productivity companion
        </Text>
      </View>

      {/* Chat Preview */}
      <View 
        className="rounded-3xl p-6 mb-6"
        style={{
          backgroundColor: "rgba(0,217,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(0,217,255,0.15)",
        }}
      >
        <View className="flex-row items-start mb-4">
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: "rgba(0,217,255,0.2)" }}
          >
            <Bot size={20} color="#00D9FF" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-foreground font-medium mb-1">Rhythmé AI</Text>
            <Text className="text-foreground/70 leading-5">
              Hi! I'm your AI assistant. I can help you plan tasks, track habits, 
              stay focused, and achieve your goals. How can I help today?
            </Text>
          </View>
        </View>

        {/* Quick Suggestions */}
        <View className="flex-row flex-wrap gap-2 mt-4">
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              activeOpacity={0.7}
              className="flex-row items-center px-4 py-2 rounded-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              {s.icon}
              <Text className="text-foreground text-sm ml-2">{s.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Coming Soon */}
      <View 
        className="rounded-3xl p-6"
        style={{
          backgroundColor: "rgba(255,107,53,0.05)",
          borderWidth: 1,
          borderColor: "rgba(255,107,53,0.15)",
        }}
      >
        <View className="flex-row items-center mb-4">
          <MessageSquare size={20} color="#FF6B35" />
          <Text className="text-primary font-semibold ml-2">Coming Soon</Text>
        </View>
        <Text className="text-foreground/70 mb-4">
          Full AI chat experience with personalized productivity insights, 
          task suggestions, and intelligent scheduling.
        </Text>
        <Button
          variant="secondary"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          Join Waitlist
        </Button>
      </View>
    </ScrollView>
  );
}
