import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  icon,
  containerClassName = "",
  className = "",
  ...props
}: InputProps) {
  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-medium text-foreground-secondary mb-2">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-surface border rounded-xl px-4 ${
          error ? "border-error" : "border-surface-border"
        }`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className={`flex-1 py-4 text-foreground ${className}`}
          placeholderTextColor="#71717A"
          {...props}
        />
      </View>
      {error && (
        <Text className="text-sm text-error mt-1">{error}</Text>
      )}
    </View>
  );
}
