import { Button } from "@/components/ui";
import { Difficulty, Priority, Task, TaskStats, TaskStorage } from "@/lib/storage";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import {
    AlertCircle,
    Brain,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Flag,
    Plus,
    Timer,
    TrendingUp,
    X,
    Zap
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
    Animated,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Vibrant priority colors
const priorityConfig: Record<Priority, { bg: string; text: string; color: string; label: string }> = {
  high: { bg: "bg-error/30", text: "text-error", color: "#EF4444", label: "High" },
  medium: { bg: "bg-warning/30", text: "text-warning", color: "#F59E0B", label: "Medium" },
  low: { bg: "bg-success/30", text: "text-success", color: "#22C55E", label: "Low" },
};

// Stats Card with vibrant styling
function StatsCard({ icon, label, value, color, gradient }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  gradient?: boolean;
}) {
  return (
    <View className="flex-1 min-w-[100px]">
      <View 
        className="rounded-2xl overflow-hidden border border-surface-border"
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
        }}
      >
        <View className="p-4">
          <View className="flex-row items-center mb-2">
            {icon}
            <Text className="text-foreground/70 text-xs ml-2 uppercase tracking-wide font-medium">
              {label}
            </Text>
          </View>
          <Text className="text-4xl font-bold" style={{ color }}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Task Item with vibrant styling
function TaskItem({ task, onToggle, onPress }: {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const isCompleted = task.status === "completed";

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
  const priorityColor = priorityConfig[task.priority].color;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={onPress} className="mb-3">
        <View 
          className="p-4 rounded-2xl border"
          style={{
            backgroundColor: isCompleted ? 'rgba(255,255,255,0.03)' : 'rgba(255,107,53,0.05)',
            borderColor: isCompleted ? 'rgba(255,255,255,0.08)' : 'rgba(255,107,53,0.15)',
          }}
        >
          <View className="flex-row items-start">
            <TouchableOpacity onPress={handleToggle} className="mt-0.5 mr-3">
              {isCompleted ? (
                <CheckCircle2 size={24} color="#FF6B35" fill="#FF6B35" />
              ) : (
                <View 
                  className="w-6 h-6 rounded-full border-2 items-center justify-center"
                  style={{ borderColor: priorityColor }}
                />
              )}
            </TouchableOpacity>

            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className={`flex-1 font-semibold text-base ${
                    isCompleted ? "text-foreground/40 line-through" : "text-foreground"
                  }`}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                <ChevronRight size={18} color="#FF6B35" />
              </View>

              {task.description && (
                <Text className="text-foreground/50 text-sm mb-2" numberOfLines={1}>
                  {task.description}
                </Text>
              )}

              <View className="flex-row items-center flex-wrap gap-2">
                <View 
                  className="px-2 py-1 rounded-lg flex-row items-center"
                  style={{ backgroundColor: `${priorityColor}25` }}
                >
                  <Flag size={12} color={priorityColor} />
                  <Text className="text-xs font-medium ml-1" style={{ color: priorityColor }}>
                    {priorityConfig[task.priority].label}
                  </Text>
                </View>

                {task.dueDate && (
                  <View 
                    className="px-2 py-1 rounded-lg flex-row items-center"
                    style={{ 
                      backgroundColor: isOverdue ? 'rgba(239,68,68,0.2)' : 'rgba(0,217,255,0.15)' 
                    }}
                  >
                    <Clock size={12} color={isOverdue ? "#EF4444" : "#00D9FF"} />
                    <Text 
                      className="text-xs font-medium ml-1"
                      style={{ color: isOverdue ? "#EF4444" : "#00D9FF" }}
                    >
                      {formatDueDate(task.dueDate)}
                    </Text>
                  </View>
                )}

                {task.category && (
                  <View className="px-2 py-1 rounded-lg bg-primary/15">
                    <Text className="text-xs font-medium text-primary">{task.category}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

type FilterType = "all" | "pending" | "in_progress" | "completed";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("medium");
  const [newCategory, setNewCategory] = useState("");

  const loadData = useCallback(async () => {
    const [tasksData, statsData] = await Promise.all([
      TaskStorage.getAll(),
      TaskStorage.getStats(),
    ]);
    setTasks(tasksData);
    setStats(statsData);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const toggleTask = async (id: string) => {
    await TaskStorage.toggleComplete(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await loadData();
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;
    await TaskStorage.create({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      priority: newPriority,
      difficulty: newDifficulty,
      category: newCategory.trim() || undefined,
      status: "pending",
      dueDate: new Date().toISOString(),
    });
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setNewDifficulty("medium");
    setNewCategory("");
    setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await loadData();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const filterTabs: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: tasks.length },
    { key: "pending", label: "To Do", count: stats?.pending || 0 },
    { key: "in_progress", label: "Active", count: stats?.inProgress || 0 },
    { key: "completed", label: "Done", count: stats?.completed || 0 },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-24"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
        }
      >
        {/* Stats Grid with vibrant colors */}
        {stats && (
          <View className="mb-6">
            <View className="flex-row gap-3 mb-3">
              <StatsCard
                icon={<TrendingUp size={18} color="#FF6B35" />}
                label="Today"
                value={stats.completedToday}
                color="#FF6B35"
              />
              <StatsCard
                icon={<Flag size={18} color="#EF4444" />}
                label="Urgent"
                value={stats.highPriority}
                color="#EF4444"
              />
            </View>
            <View className="flex-row gap-3">
              <StatsCard
                icon={<AlertCircle size={18} color="#F59E0B" />}
                label="Overdue"
                value={stats.overdue}
                color={stats.overdue > 0 ? "#EF4444" : "#22C55E"}
              />
              <StatsCard
                icon={<Calendar size={18} color="#00D9FF" />}
                label="Total"
                value={stats.total}
                color="#00D9FF"
              />
            </View>
          </View>
        )}

        {/* Filter Tabs with orange accent */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {filterTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilter(tab.key);
                }}
                className={`px-4 py-2.5 rounded-xl flex-row items-center ${
                  filter === tab.key ? "bg-primary" : "bg-surface/50 border border-surface-border"
                }`}
              >
                <Text className={`font-semibold ${filter === tab.key ? "text-white" : "text-foreground/60"}`}>
                  {tab.label}
                </Text>
                <View className={`ml-2 px-2 py-0.5 rounded-full ${filter === tab.key ? "bg-white/25" : "bg-surface-hover"}`}>
                  <Text className={`text-xs font-bold ${filter === tab.key ? "text-white" : "text-foreground/50"}`}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
              <CheckCircle2 size={32} color="#FF6B35" />
            </View>
            <Text className="text-foreground text-lg font-semibold mb-1">No tasks yet</Text>
            <Text className="text-foreground/50 text-sm">Tap + to create your first task</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onPress={() => router.push({ pathname: "/tasks/[id]", params: { id: task.id } })}
            />
          ))
        )}
      </ScrollView>

      {/* Vibrant FAB */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAddModal(true);
        }}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: "#FF6B35",
          shadowColor: "#FF6B35",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <BlurView intensity={60} tint="dark" className="flex-1 justify-end">
          <Pressable className="flex-1" onPress={() => setShowAddModal(false)} />
          <View className="bg-background rounded-t-3xl p-6 pb-10 border-t border-primary/30">
            {/* Orange accent line at top */}
            <View className="w-12 h-1 bg-primary rounded-full self-center mb-6" />
            
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-foreground text-2xl font-bold">New Task</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} className="p-2 bg-surface rounded-xl">
                <X size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>

            <Text className="text-primary text-sm font-semibold mb-2">TITLE</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="What do you need to do?"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-surface border border-primary/20 rounded-xl px-4 py-4 text-foreground text-lg mb-4"
              autoFocus
            />

            <Text className="text-cyan-400 text-sm font-semibold mb-2">DESCRIPTION</Text>
            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Add details (optional)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-surface border border-accent/20 rounded-xl px-4 py-4 text-foreground mb-4"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text className="text-foreground/70 text-sm font-semibold mb-2">CATEGORY</Text>
            <TextInput
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="e.g., Work, Personal"
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-surface border border-surface-border rounded-xl px-4 py-4 text-foreground mb-4"
            />

            <Text className="text-accent text-sm font-semibold mb-2">DIFFICULTY / TIME</Text>
            <View className="flex-row gap-2 mb-4">
              {([
                { key: "quick" as Difficulty, label: "Quick", time: "15m", icon: <Zap size={18} /> },
                { key: "medium" as Difficulty, label: "Medium", time: "1h", icon: <Timer size={18} /> },
                { key: "deep" as Difficulty, label: "Deep", time: "2h+", icon: <Brain size={18} /> },
              ]).map((d) => (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNewDifficulty(d.key);
                  }}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: newDifficulty === d.key ? 'rgba(0,217,255,0.2)' : 'rgba(255,255,255,0.05)',
                    borderWidth: 2,
                    borderColor: newDifficulty === d.key ? '#00D9FF' : 'transparent',
                  }}
                >
                  {React.cloneElement(d.icon, { color: newDifficulty === d.key ? "#00D9FF" : "#71717A" })}
                  <Text
                    className="font-bold mt-1"
                    style={{ color: newDifficulty === d.key ? "#00D9FF" : "#71717A" }}
                  >
                    {d.label}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: newDifficulty === d.key ? "#00D9FF" : "#71717A" }}
                  >
                    {d.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-foreground/70 text-sm font-semibold mb-2">PRIORITY</Text>
            <View className="flex-row gap-2 mb-6">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNewPriority(p);
                  }}
                  className="flex-1 py-4 rounded-xl flex-row items-center justify-center"
                  style={{
                    backgroundColor: newPriority === p ? `${priorityConfig[p].color}30` : 'rgba(255,255,255,0.05)',
                    borderWidth: 2,
                    borderColor: newPriority === p ? priorityConfig[p].color : 'transparent',
                  }}
                >
                  <Flag size={18} color={newPriority === p ? priorityConfig[p].color : "#71717A"} />
                  <Text
                    className="ml-2 font-bold capitalize"
                    style={{ color: newPriority === p ? priorityConfig[p].color : "#71717A" }}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button onPress={addTask} disabled={!newTitle.trim()} size="lg">
              Create Task
            </Button>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}