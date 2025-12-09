import AsyncStorage from "@react-native-async-storage/async-storage";

const GOAL_KEY = "rhythme_goal";

export interface LongTermGoal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "achieved" | "paused";
  progress: number; // 0-100
}

export interface GoalInput {
  title: string;
  description?: string;
  targetDate: string;
}

function generateId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const GoalStorage = {
  /**
   * Get the user's long-term goal (only ONE allowed)
   */
  async get(): Promise<LongTermGoal | null> {
    try {
      const data = await AsyncStorage.getItem(GOAL_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting goal:", error);
      return null;
    }
  },

  /**
   * Check if user has a goal set
   */
  async hasGoal(): Promise<boolean> {
    const goal = await this.get();
    return goal !== null;
  },

  /**
   * Create the long-term goal (replaces any existing)
   */
  async create(input: GoalInput): Promise<LongTermGoal> {
    const now = new Date().toISOString();
    const goal: LongTermGoal = {
      id: generateId(),
      title: input.title,
      description: input.description,
      targetDate: input.targetDate,
      createdAt: now,
      updatedAt: now,
      status: "active",
      progress: 0,
    };

    await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(goal));
    return goal;
  },

  /**
   * Update goal properties
   */
  async update(updates: Partial<Omit<LongTermGoal, "id" | "createdAt">>): Promise<LongTermGoal | null> {
    const goal = await this.get();
    if (!goal) return null;

    const updated: LongTermGoal = {
      ...goal,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Update goal progress (0-100)
   */
  async updateProgress(progress: number): Promise<LongTermGoal | null> {
    return this.update({ 
      progress: Math.max(0, Math.min(100, progress)),
      status: progress >= 100 ? "achieved" : "active",
    });
  },

  /**
   * Delete the goal (reset workspace)
   */
  async delete(): Promise<void> {
    await AsyncStorage.removeItem(GOAL_KEY);
  },

  /**
   * Calculate days remaining to target date
   */
  getDaysRemaining(goal: LongTermGoal): number {
    const target = new Date(goal.targetDate);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  /**
   * Format target date for display
   */
  formatTargetDate(goal: LongTermGoal): string {
    return new Date(goal.targetDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
};
