import { StyleSheet, Text, View } from "react-native";
import {
  CalendarSync,
  Clock2Icon,
  Home,
  ListTodo,
  TargetIcon,
} from "lucide-react-native";
import React from "react";
import { Tabs } from "expo-router";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={2} />
          ),
          animation: "shift",
        }}
      />
      <Tabs.Screen
        name="Tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <ListTodo color={color} size={size} strokeWidth={2} />
          ),
          tabBarBadge: 15,
          animation: "shift",
          popToTopOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="Habits"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size }) => (
            <CalendarSync color={color} size={size} strokeWidth={2} />
          ),
          animation: "shift",
          popToTopOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="Focus"
        options={{
          title: "Focus",
          tabBarIcon: ({ color, size }) => (
            <Clock2Icon color={color} size={size} strokeWidth={2} />
          ),
          animation: "shift",
          popToTopOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="Goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => (
            <TargetIcon color={color} size={size} strokeWidth={2} />
          ),
          animation: "shift",
          popToTopOnBlur: true,
          tabBarBadge: 2,
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({});
