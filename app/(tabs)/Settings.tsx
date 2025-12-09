import { useAuth } from "@/context/AuthProvider";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
    Bell,
    Calendar,
    ChevronRight,
    Info,
    Key,
    LogOut,
    Mail,
    Moon,
    Shield,
    Smartphone,
    Sparkles,
    Trash2,
    Vibrate,
    Zap
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  accent?: "orange" | "cyan" | "green";
}

function SettingItem({ icon, title, subtitle, onPress, rightElement, danger, accent = "orange" }: SettingItemProps) {
  const accentColors = {
    orange: { bg: 'rgba(255,107,53,0.15)', border: 'rgba(255,107,53,0.25)' },
    cyan: { bg: 'rgba(0,217,255,0.12)', border: 'rgba(0,217,255,0.2)' },
    green: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.2)' },
  };
  
  const colors = danger 
    ? { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)' }
    : accentColors[accent];

  return (
    <TouchableOpacity
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
      className="flex-row items-center py-4"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View 
        className="w-11 h-11 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`font-semibold text-base ${danger ? 'text-error' : 'text-foreground'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-foreground/50 text-sm mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color="#FF6B35" />)}
    </TouchableOpacity>
  );
}

function SettingSection({ title, children, accent = "orange" }: { title: string; children: React.ReactNode; accent?: "orange" | "cyan" | "green" }) {
  const titleColors = {
    orange: "#FF6B35",
    cyan: "#00D9FF",
    green: "#22C55E",
  };
  
  return (
    <View className="mb-6">
      <Text 
        className="text-sm font-bold uppercase tracking-wider mb-3 px-1"
        style={{ color: titleColors[accent] }}
      >
        {title}
      </Text>
      <View 
        className="rounded-2xl px-4"
        style={{ 
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAuthProvider = () => {
    const provider = user?.app_metadata?.provider;
    if (provider === "email") return "Email & Password";
    if (provider === "google") return "Google";
    if (provider === "github") return "GitHub";
    if (provider === "discord") return "Discord";
    if (provider === "facebook") return "Facebook";
    return provider || "Unknown";
  };

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || "U";
    return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-20">
      {/* Profile Card with Gradient Border */}
      <View 
        className="rounded-3xl p-6 mb-6"
        style={{ 
          backgroundColor: 'rgba(255,107,53,0.08)',
          borderWidth: 2,
          borderColor: 'rgba(255,107,53,0.3)',
        }}
      >
        <View className="flex-row items-center">
          {user?.user_metadata?.avatar_url ? (
            <Image
              source={{ uri: user.user_metadata.avatar_url }}
              className="w-18 h-18 rounded-2xl"
              style={{ width: 72, height: 72 }}
            />
          ) : (
            <View 
              className="rounded-2xl items-center justify-center"
              style={{ 
                width: 72, 
                height: 72, 
                backgroundColor: '#FF6B35',
                shadowColor: '#FF6B35',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
              }}
            >
              <Text className="text-white text-2xl font-bold">{getInitials()}</Text>
            </View>
          )}
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className="text-foreground text-xl font-bold mr-2">
                {user?.user_metadata?.full_name || "User"}
              </Text>
              <Sparkles size={16} color="#FF6B35" />
            </View>
            <Text className="text-foreground/60 text-sm mt-1">
              {user?.email}
            </Text>
            <View 
              className="mt-2 px-3 py-1 rounded-full self-start flex-row items-center"
              style={{ backgroundColor: 'rgba(0,217,255,0.15)' }}
            >
              <Zap size={12} color="#00D9FF" />
              <Text className="text-accent text-xs font-semibold ml-1">Pro Member</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <SettingSection title="Account" accent="orange">
        <SettingItem
          icon={<Mail size={20} color="#FF6B35" />}
          title="Email"
          subtitle={user?.email || "Not set"}
          accent="orange"
        />
        <SettingItem
          icon={<Shield size={20} color="#FF6B35" />}
          title="Auth Provider"
          subtitle={getAuthProvider()}
          accent="orange"
        />
        <SettingItem
          icon={<Calendar size={20} color="#FF6B35" />}
          title="Member Since"
          subtitle={formatDate(user?.created_at)}
          accent="orange"
        />
        <SettingItem
          icon={<Key size={20} color="#FF6B35" />}
          title="Change Password"
          subtitle="Update your password"
          accent="orange"
          onPress={() => Alert.alert("Coming Soon", "Password change will be available soon.")}
        />
      </SettingSection>

      {/* Preferences Section */}
      <SettingSection title="Preferences" accent="cyan">
        <SettingItem
          icon={<Bell size={20} color="#00D9FF" />}
          title="Notifications"
          subtitle="Receive task reminders"
          accent="cyan"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNotifications(value);
              }}
              trackColor={{ false: "#333", true: "#FF6B35" }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <SettingItem
          icon={<Vibrate size={20} color="#00D9FF" />}
          title="Haptic Feedback"
          subtitle="Vibration on interactions"
          accent="cyan"
          rightElement={
            <Switch
              value={haptics}
              onValueChange={(value) => {
                if (value) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setHaptics(value);
              }}
              trackColor={{ false: "#333", true: "#FF6B35" }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <SettingItem
          icon={<Moon size={20} color="#00D9FF" />}
          title="Dark Mode"
          subtitle="Always on (system default)"
          accent="cyan"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#333", true: "#FF6B35" }}
              thumbColor="#FFFFFF"
              disabled
            />
          }
        />
      </SettingSection>

      {/* App Info Section */}
      <SettingSection title="About" accent="green">
        <SettingItem
          icon={<Smartphone size={20} color="#22C55E" />}
          title="App Version"
          subtitle="1.0.0 (Build 1)"
          accent="green"
        />
        <SettingItem
          icon={<Info size={20} color="#22C55E" />}
          title="About Rhythmé"
          subtitle="Your productivity companion"
          accent="green"
          onPress={() => Alert.alert("Rhythmé", "A premium productivity app to help you stay focused and achieve your goals.\n\nBuilt with ❤️ using React Native & Expo.")}
        />
      </SettingSection>

      {/* Danger Zone */}
      <SettingSection title="Danger Zone" accent="orange">
        <SettingItem
          icon={<Trash2 size={20} color="#EF4444" />}
          title="Clear All Data"
          subtitle="Delete all tasks, habits, and goals"
          danger
          onPress={() => Alert.alert("Clear Data", "This will delete all your local data. Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: () => {} },
          ])}
        />
        <SettingItem
          icon={<LogOut size={20} color="#EF4444" />}
          title="Sign Out"
          subtitle="Log out of your account"
          danger
          onPress={handleSignOut}
        />
      </SettingSection>
    </ScrollView>
  );
}
