import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outline";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-surface border border-surface-border",
  elevated: "bg-surface-hover border border-surface-border",
  outline: "bg-transparent border border-surface-border",
};

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  return (
    <View
      className={`rounded-xl p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <View className={`mb-3 ${className}`}>{children}</View>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <View className={className}>
      {typeof children === "string" ? (
        <View>
          <Text className="text-lg font-semibold text-foreground">{children}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

import { Text } from "react-native";

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <View className={className}>{children}</View>;
}
