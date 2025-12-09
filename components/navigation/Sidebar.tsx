import { useAuth } from "@/context/AuthProvider";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import * as Haptics from "expo-haptics";
import {
    Calendar,
    CheckSquare,
    ChevronRight,
    Clock,
    Home,
    LogOut,
    Settings,
    Target,
    User,
} from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onPress: () => void;
  badge?: number;
}

function NavItem({ icon, label, isActive, onPress, badge }: NavItemProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`flex-row items-center px-4 py-3 mx-3 rounded-xl mb-1 ${
        isActive ? "bg-primary/20" : "bg-transparent"
      }`}
    >
      <View className={isActive ? "text-primary" : "text-foreground-secondary"}>
        {icon}
      </View>
      <Text
        className={`flex-1 ml-3 font-medium ${
          isActive ? "text-primary" : "text-foreground-secondary"
        }`}
      >
        {label}
      </Text>
      {badge !== undefined && badge > 0 && (
        <View className="bg-primary px-2 py-0.5 rounded-full">
          <Text className="text-xs font-semibold text-white">{badge}</Text>
        </View>
      )}
      {isActive && <ChevronRight size={16} color="#FF6B35" />}
    </TouchableOpacity>
  );
}

const navItems = [
  { name: "index", label: "Dashboard", icon: Home },
  { name: "Tasks", label: "Tasks", icon: CheckSquare, badge: 5 },
  { name: "Habits", label: "Habits", icon: Calendar },
  { name: "Focus", label: "Focus", icon: Clock },
  { name: "Goals", label: "Goals", icon: Target, badge: 2 },
];

export function Sidebar({ navigation, state }: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const currentRoute = state.routes[state.index]?.name;

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await signOut();
  };

  return (
    <View className="flex-1 bg-background border-r border-surface-border">
      {/* Header / Profile */}
      <View className="pt-16 pb-6 px-4 border-b border-surface-border">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center">
            <User size={24} color="#FF6B35" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-foreground font-semibold text-base" numberOfLines={1}>
              {user?.user_metadata?.full_name || "User"}
            </Text>
            <Text className="text-foreground-muted text-sm" numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <ScrollView className="flex-1 py-4">
        {navItems.map((item) => (
          <NavItem
            key={item.name}
            icon={
              <item.icon
                size={20}
                color={currentRoute === item.name ? "#FF6B35" : "#71717A"}
              />
            }
            label={item.label}
            isActive={currentRoute === item.name}
            badge={item.badge}
            onPress={() => navigation.navigate(item.name)}
          />
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="p-4 border-t border-surface-border">
        <NavItem
          icon={<Settings size={20} color="#71717A" />}
          label="Settings"
          onPress={() => navigation.navigate("Settings")}
        />
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.7}
          className="flex-row items-center px-4 py-3 mx-3 rounded-xl mt-2"
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="ml-3 font-medium text-error">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
