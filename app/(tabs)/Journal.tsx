import { Button } from "@/components/ui";
import * as Haptics from "expo-haptics";
import { BookOpen, Feather } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function JournalScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-foreground text-2xl font-bold mb-2">Journal</Text>
        <Text className="text-foreground/50">Capture your thoughts and reflections</Text>
      </View>

      {/* Empty State */}
      <View 
        className="items-center justify-center py-20 rounded-3xl"
        style={{
          backgroundColor: "rgba(255,107,53,0.05)",
          borderWidth: 1,
          borderColor: "rgba(255,107,53,0.15)",
          borderStyle: "dashed",
        }}
      >
        <View 
          className="w-20 h-20 rounded-2xl items-center justify-center mb-6"
          style={{ backgroundColor: "rgba(255,107,53,0.15)" }}
        >
          <BookOpen size={40} color="#FF6B35" />
        </View>
        <Text className="text-foreground text-lg font-semibold mb-2">
          Start Your Journal
        </Text>
        <Text className="text-foreground/50 text-center px-8 mb-6">
          Write about your day, track your mood, and reflect on your progress
        </Text>
        <Button
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          icon={<Feather size={18} color="#FFFFFF" />}
        >
          Write First Entry
        </Button>
      </View>

      {/* Coming Soon Features */}
      <View className="mt-8">
        <Text className="text-foreground/70 text-sm font-semibold mb-3 uppercase tracking-wide">
          Coming Soon
        </Text>
        {[
          { icon: "📝", title: "Daily Prompts", desc: "Get inspired with thoughtful questions" },
          { icon: "📊", title: "Mood Tracking", desc: "Track how you feel over time" },
          { icon: "🔒", title: "Private & Secure", desc: "Your entries stay on your device" },
        ].map((item, i) => (
          <View 
            key={i}
            className="flex-row items-center p-4 rounded-2xl mb-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <Text className="text-2xl mr-4">{item.icon}</Text>
            <View className="flex-1">
              <Text className="text-foreground font-medium">{item.title}</Text>
              <Text className="text-foreground/50 text-sm">{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
