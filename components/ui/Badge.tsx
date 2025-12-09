import React from "react";
import { Text, View } from "react-native";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "accent" | "success" | "warning" | "error";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  default: {
    bg: "bg-surface",
    text: "text-foreground-secondary",
  },
  primary: {
    bg: "bg-primary/20",
    text: "text-primary",
  },
  accent: {
    bg: "bg-accent/20",
    text: "text-accent",
  },
  success: {
    bg: "bg-success/20",
    text: "text-success",
  },
  warning: {
    bg: "bg-warning/20",
    text: "text-warning",
  },
  error: {
    bg: "bg-error/20",
    text: "text-error",
  },
};

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      className={`rounded-full self-start ${variantStyle.bg} ${className}`}
    >
      <Text
        className={`font-medium ${sizeStyle} ${variantStyle.text}`}
      >
        {children}
      </Text>
    </View>
  );
}
