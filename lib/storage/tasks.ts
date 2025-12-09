import AsyncStorage from "@react-native-async-storage/async-storage";

// Task types
export type Priority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type Difficulty = "quick" | "medium" | "deep"; // Quick (15m), Medium (1h), Deep (2h+)

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  difficulty: Difficulty;    // NEW: task difficulty/time estimate
  goalId?: string;           // NEW: link to long-term goal
  subGoalId?: string;        // NEW: link to sub-goal (Phase 2)
  dueDate?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  subtasks?: Subtask[];
  estimatedMinutes?: number; // NEW: custom time estimate
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completedToday: number;
  highPriority: number;
}

const TASKS_STORAGE_KEY = "@rhythme_tasks";

// Storage service for tasks
export const TaskStorage = {
  // Get all tasks
  async getAll(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as Task[];
      }
      return [];
    } catch (error) {
      console.error("Error getting tasks:", error);
      return [];
    }
  },

  // Get single task by ID
  async getById(id: string): Promise<Task | null> {
    try {
      const tasks = await this.getAll();
      return tasks.find((t) => t.id === id) || null;
    } catch (error) {
      console.error("Error getting task:", error);
      return null;
    }
  },

  // Create a new task
  async create(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    try {
      const tasks = await this.getAll();
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };
      tasks.unshift(newTask);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  // Update a task
  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const tasks = await this.getAll();
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return null;

      const updatedTask: Task = {
        ...tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // If marked as completed, set completedAt
      if (updates.status === "completed" && !tasks[index].completedAt) {
        updatedTask.completedAt = new Date().toISOString();
      }

      tasks[index] = updatedTask;
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  // Delete a task
  async delete(id: string): Promise<boolean> {
    try {
      const tasks = await this.getAll();
      const filtered = tasks.filter((t) => t.id !== id);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      return false;
    }
  },

  // Toggle task completion
  async toggleComplete(id: string): Promise<Task | null> {
    const task = await this.getById(id);
    if (!task) return null;

    const newStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";
    return this.update(id, { status: newStatus });
  },

  // Get task statistics
  async getStats(): Promise<TaskStats> {
    const tasks = await this.getAll();
    const today = new Date().toDateString();

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      overdue: tasks.filter((t) => {
        if (!t.dueDate || t.status === "completed") return false;
        return new Date(t.dueDate) < new Date();
      }).length,
      completedToday: tasks.filter((t) => {
        if (!t.completedAt) return false;
        return new Date(t.completedAt).toDateString() === today;
      }).length,
      highPriority: tasks.filter(
        (t) => t.priority === "high" && t.status !== "completed"
      ).length,
    };
  },

  // Seed with sample data (for demo)
  async seedSampleData(): Promise<void> {
    const existing = await this.getAll();
    if (existing.length > 0) return;

    const sampleTasks: Omit<Task, "id" | "createdAt" | "updatedAt">[] = [
      {
        title: "Review project proposal",
        description: "Go through the Q1 project proposal and provide feedback",
        status: "completed",
        priority: "high",
        difficulty: "medium",
        dueDate: new Date().toISOString(),
        category: "Work",
        completedAt: new Date().toISOString(),
      },
      {
        title: "Team standup meeting",
        status: "completed",
        priority: "medium",
        difficulty: "quick",
        dueDate: new Date().toISOString(),
        category: "Work",
        completedAt: new Date().toISOString(),
      },
      {
        title: "Update documentation",
        description: "Update API docs for v2.0 release",
        status: "in_progress",
        priority: "medium",
        difficulty: "deep",
        dueDate: new Date().toISOString(),
        category: "Work",
      },
      {
        title: "Code review for PR #42",
        status: "pending",
        priority: "high",
        difficulty: "medium",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        category: "Work",
      },
      {
        title: "Prepare presentation",
        description: "Create slides for Friday's demo",
        status: "pending",
        priority: "low",
        difficulty: "deep",
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        category: "Work",
      },
      {
        title: "Buy groceries",
        status: "pending",
        priority: "medium",
        difficulty: "quick",
        dueDate: new Date().toISOString(),
        category: "Personal",
      },
      {
        title: "Call mom",
        status: "pending",
        priority: "low",
        difficulty: "quick",
        category: "Personal",
      },
    ];

    for (const task of sampleTasks) {
      await this.create(task);
    }
  },
};
