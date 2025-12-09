import { useAuth } from "@/context/AuthProvider";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
    BookOpen,
    Bot,
    CheckSquare,
    ChevronUp,
    Home,
    LogOut,
    Settings,
    Sparkles,
    Target,
    Timer,
    Zap,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface NavItem {
  key: string;
  icon: (props: { size: number; color: string; strokeWidth?: number }) => React.ReactNode;
  label: string;
  route: string;
}

const mainNavItems: NavItem[] = [
  { key: "index", icon: (p) => <Home {...p} />, label: "Home", route: "/(tabs)" },
  { key: "Tasks", icon: (p) => <CheckSquare {...p} />, label: "Tasks", route: "/(tabs)/Tasks" },
  { key: "Habits", icon: (p) => <Target {...p} />, label: "Habits", route: "/(tabs)/Habits" },
  { key: "Focus", icon: (p) => <Timer {...p} />, label: "Focus", route: "/(tabs)/Focus" },
  { key: "Settings", icon: (p) => <Settings {...p} />, label: "Settings", route: "/(tabs)/Settings" },
];

const expandedNavItems: NavItem[] = [
  { key: "Goals", icon: (p) => <Zap {...p} />, label: "Goals", route: "/(tabs)/Goals" },
  { key: "Journal", icon: (p) => <BookOpen {...p} />, label: "Journal", route: "/(tabs)/Journal" },
  { key: "AI", icon: (p) => <Bot {...p} />, label: "AI", route: "/(tabs)/AI" },
];

interface BottomAppBarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomAppBar({ activeRoute, onNavigate }: BottomAppBarProps) {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);

  const bottomPadding = Math.max(insets.bottom, 24);
  const COLLAPSED_HEIGHT = 100 + bottomPadding;
  const EXPANDED_HEIGHT = 420 + bottomPadding;

  const height = useSharedValue(COLLAPSED_HEIGHT);
  const rotation = useSharedValue(0);
  const expandedOpacity = useSharedValue(0);
  const startHeight = useSharedValue(COLLAPSED_HEIGHT);

  const doExpand = useCallback(() => {
    setIsExpanded(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const doCollapse = useCallback(() => {
    setIsExpanded(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startHeight.value = height.value;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((event) => {
      let newHeight = startHeight.value - event.translationY;

      if (newHeight > EXPANDED_HEIGHT) {
        const overflow = newHeight - EXPANDED_HEIGHT;
        newHeight = EXPANDED_HEIGHT + overflow * 0.15;
      } else if (newHeight < COLLAPSED_HEIGHT) {
        const underflow = COLLAPSED_HEIGHT - newHeight;
        newHeight = COLLAPSED_HEIGHT - underflow * 0.15;
      }

      height.value = newHeight;

      const progress = Math.max(
        0,
        Math.min(1, (newHeight - COLLAPSED_HEIGHT) / (EXPANDED_HEIGHT - COLLAPSED_HEIGHT))
      );
      rotation.value = progress * 180;
      expandedOpacity.value = progress;
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const currentHeight = height.value;
      const midpoint = (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;

      let shouldExpand: boolean;

      if (velocity < -500) {
        shouldExpand = true;
      } else if (velocity > 500) {
        shouldExpand = false;
      } else {
        shouldExpand = currentHeight > midpoint;
      }

      if (shouldExpand) {
        height.value = withSpring(EXPANDED_HEIGHT, { damping: 20, stiffness: 150 });
        rotation.value = withTiming(180, { duration: 300 });
        expandedOpacity.value = withTiming(1, { duration: 250 });
        runOnJS(doExpand)();
      } else {
        height.value = withSpring(COLLAPSED_HEIGHT, { damping: 20, stiffness: 150 });
        rotation.value = withTiming(0, { duration: 300 });
        expandedOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(doCollapse)();
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: expandedOpacity.value,
  }));

  const handleNavPress = useCallback(
    (route: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onNavigate(route);

      if (isExpanded) {
        height.value = withSpring(COLLAPSED_HEIGHT, { damping: 20, stiffness: 150 });
        rotation.value = withTiming(0, { duration: 300 });
        expandedOpacity.value = withTiming(0, { duration: 200 });
        setIsExpanded(false);
      }
    },
    [isExpanded, COLLAPSED_HEIGHT, onNavigate, height, rotation, expandedOpacity]
  );

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await signOut();
    router.replace("/(auth)/login");
  };

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || "U";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderNavItem = useCallback(
    (item: NavItem, isMainNav: boolean = true) => {
      const isActive = activeRoute === item.key || (item.key === "index" && activeRoute === "index");

      return (
        <TouchableOpacity
          key={item.key}
          onPress={() => handleNavPress(item.route)}
          activeOpacity={0.7}
          style={[styles.navItem, isMainNav ? styles.mainNavItem : styles.expandedNavItem]}
        >
          <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
            {item.icon({
              size: isMainNav ? 22 : 24,
              color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
              strokeWidth: isActive ? 2.5 : 2,
            })}
          </View>
          <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
          {isActive && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      );
    },
    [activeRoute, handleNavPress]
  );

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView intensity={100} tint="dark" style={styles.blurView}>
        <View style={styles.content}>
          {/* Drag Handle */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.handleContainer}>
              <View style={styles.handleBar} />
              <Animated.View style={chevronStyle}>
                <ChevronUp size={16} color="#FF6B35" />
              </Animated.View>
            </Animated.View>
          </GestureDetector>

          {/* Main Nav */}
          <View style={styles.mainNav}>
            {mainNavItems.map((item) => renderNavItem(item, true))}
          </View>

          {/* Expanded Content */}
          <Animated.View
            style={[styles.expandedContent, expandedStyle]}
            pointerEvents={isExpanded ? "auto" : "none"}
          >
            <View style={styles.expandedNav}>
              {expandedNavItems.map((item) => renderNavItem(item, false))}
            </View>

            <View style={styles.profileCard}>
              {user?.user_metadata?.avatar_url ? (
                <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getInitials()}</Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <View style={styles.profileNameRow}>
                  <Text style={styles.profileName}>{user?.user_metadata?.full_name || "User"}</Text>
                  <Sparkles size={14} color="#FF6B35" style={{ marginLeft: 6 }} />
                </View>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
              <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7} style={styles.signOutButton}>
                <LogOut size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={{ height: bottomPadding }} />
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurView: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    backgroundColor: "rgba(10,10,15,0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,107,53,0.3)",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(255,107,53,0.5)",
    borderRadius: 3,
    marginBottom: 4,
  },
  mainNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: "center",
    position: "relative",
  },
  mainNavItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  expandedNavItem: {
    flex: 1,
    paddingVertical: 12,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 14,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  iconContainerActive: {
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
  },
  navLabelActive: {
    color: "#FF6B35",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF6B35",
  },
  expandedContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  expandedNav: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,107,53,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.2)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FF6B35",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  profileEmail: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
  },
});
