import { Button } from "@/components/ui";
import { Priority, Task, TaskStatus, TaskStorage } from "@/lib/storage";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    FileText,
    Flag,
    Save,
    Tag,
    Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const priorityConfig: Record<Priority, { bg: string; text: string; color: string; label: string }> = {
  high: { bg: "bg-error/30", text: "text-error", color: "#EF4444", label: "High" },
  medium: { bg: "bg-warning/30", text: "text-warning", color: "#F59E0B", label: "Medium" },
  low: { bg: "bg-success/30", text: "text-success", color: "#22C55E", label: "Low" },
};

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: "To Do", color: "#71717A" },
  in_progress: { label: "In Progress", color: "#00D9FF" },
  completed: { label: "Completed", color: "#22C55E" },
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadTask();
  }, [id]);

  useEffect(() => {
    if (task) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [task]);

  const loadTask = async () => {
    if (!id) return;
    const data = await TaskStorage.getById(id);
    if (data) {
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setPriority(data.priority);
      setStatus(data.status);
      setCategory(data.category || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!task || !title.trim()) return;
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await TaskStorage.update(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      category: category.trim() || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert("Delete Task", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await TaskStorage.delete(task.id);
          router.back();
        },
      },
    ]);
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newStatus: TaskStatus = status === "completed" ? "pending" : "completed";
    setStatus(newStatus);
    await TaskStorage.update(task.id, { status: newStatus });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground/50">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground/50">Task not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-3 bg-primary rounded-xl">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-primary/20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-surface rounded-xl">
          <ArrowLeft size={22} color="#FF6B35" />
        </TouchableOpacity>
        <Text className="text-foreground text-lg font-bold">Edit Task</Text>
        <TouchableOpacity onPress={handleDelete} className="p-2 bg-error/20 rounded-xl">
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView className="flex-1" contentContainerClassName="p-4 pb-32">
          {/* Status Toggle Card */}
          <TouchableOpacity onPress={handleToggleComplete} className="mb-6">
            <View
              className="p-4 rounded-2xl flex-row items-center border-2"
              style={{
                backgroundColor: status === "completed" ? "rgba(34,197,94,0.15)" : "rgba(255,107,53,0.1)",
                borderColor: status === "completed" ? "rgba(34,197,94,0.3)" : "rgba(255,107,53,0.3)",
              }}
            >
              {status === "completed" ? (
                <CheckCircle2 size={28} color="#22C55E" fill="#22C55E" />
              ) : (
                <Circle size={28} color="#FF6B35" />
              )}
              <View className="ml-4 flex-1">
                <Text className="text-foreground font-semibold text-lg">
                  {status === "completed" ? "Completed!" : "Mark as complete"}
                </Text>
                <Text className="text-foreground/50 text-sm">
                  {status === "completed" ? "Tap to reopen" : "Tap to finish this task"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Title */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <FileText size={16} color="#FF6B35" />
              <Text className="text-primary text-sm font-semibold ml-2">TITLE</Text>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-surface border-2 border-primary/20 rounded-xl px-4 py-4 text-foreground text-lg"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <FileText size={16} color="#00D9FF" />
              <Text className="text-accent text-sm font-semibold ml-2">DESCRIPTION</Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add details..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-surface border-2 border-accent/20 rounded-xl px-4 py-4 text-foreground"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Tag size={16} color="#A1A1AA" />
              <Text className="text-foreground/70 text-sm font-semibold ml-2">CATEGORY</Text>
            </View>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Work, Personal"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-surface border-2 border-surface-border rounded-xl px-4 py-4 text-foreground"
            />
          </View>

          {/* Priority */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Flag size={16} color="#F59E0B" />
              <Text className="text-warning text-sm font-semibold ml-2">PRIORITY</Text>
            </View>
            <View className="flex-row gap-2">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPriority(p);
                  }}
                  className="flex-1 py-4 rounded-xl flex-row items-center justify-center"
                  style={{
                    backgroundColor: priority === p ? `${priorityConfig[p].color}30` : "rgba(255,255,255,0.05)",
                    borderWidth: 2,
                    borderColor: priority === p ? priorityConfig[p].color : "transparent",
                  }}
                >
                  <Flag size={18} color={priority === p ? priorityConfig[p].color : "#71717A"} />
                  <Text
                    className="ml-2 font-bold capitalize"
                    style={{ color: priority === p ? priorityConfig[p].color : "#71717A" }}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Clock size={16} color="#00D9FF" />
              <Text className="text-accent text-sm font-semibold ml-2">STATUS</Text>
            </View>
            <View className="flex-row gap-2">
              {(["pending", "in_progress", "completed"] as TaskStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStatus(s);
                  }}
                  className="flex-1 py-3 rounded-xl"
                  style={{
                    backgroundColor: status === s ? `${statusConfig[s].color}25` : "rgba(255,255,255,0.05)",
                    borderWidth: 2,
                    borderColor: status === s ? statusConfig[s].color : "transparent",
                  }}
                >
                  <Text
                    className="text-center font-semibold"
                    style={{ color: status === s ? statusConfig[s].color : "#71717A" }}
                  >
                    {statusConfig[s].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Meta Info */}
          <View 
            className="p-4 rounded-2xl border-2 mb-6"
            style={{ backgroundColor: "rgba(0,217,255,0.05)", borderColor: "rgba(0,217,255,0.15)" }}
          >
            <View className="flex-row items-center mb-3">
              <Calendar size={16} color="#00D9FF" />
              <Text className="text-accent text-sm font-semibold ml-2">INFO</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-foreground/50">Created</Text>
              <Text className="text-foreground">{new Date(task.createdAt).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-foreground/50">Updated</Text>
              <Text className="text-foreground">{new Date(task.updatedAt).toLocaleDateString()}</Text>
            </View>
            {task.completedAt && (
              <View className="flex-row justify-between">
                <Text className="text-foreground/50">Completed</Text>
                <Text className="text-success font-semibold">{new Date(task.completedAt).toLocaleDateString()}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t-2 border-primary/20">
          <SafeAreaView edges={["bottom"]}>
            <Button onPress={handleSave} loading={saving} disabled={!title.trim()} size="lg" icon={<Save size={20} color="#FFFFFF" />}>
              Save Changes
            </Button>
          </SafeAreaView>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
