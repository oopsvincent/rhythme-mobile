import * as Haptics from "expo-haptics";
import React from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity
} from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, { container: string; text: string }> = {
  primary: {
    container: "bg-primary",
    text: "text-white",
  },
  secondary: {
    container: "bg-surface border border-surface-border",
    text: "text-foreground",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-foreground-secondary",
  },
  danger: {
    container: "bg-error",
    text: "text-white",
  },
};

const sizeStyles: Record<string, { container: string; text: string }> = {
  sm: {
    container: "py-2 px-4 rounded-lg",
    text: "text-sm",
  },
  md: {
    container: "py-3 px-6 rounded-xl",
    text: "text-base",
  },
  lg: {
    container: "py-4 px-8 rounded-xl",
    text: "text-lg",
  },
};

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  icon,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={`flex-row items-center justify-center ${sizeStyle.container} ${variantStyle.container} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#fff" : "#FF6B35"}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`font-semibold ${sizeStyle.text} ${variantStyle.text} ${
              icon ? "ml-2" : ""
            }`}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
