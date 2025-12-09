/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Background
        background: {
          DEFAULT: "#0A0A0F",
          secondary: "#12121A",
          tertiary: "#1A1A24",
        },
        // Foreground
        foreground: {
          DEFAULT: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#71717A",
        },
        // Primary - Orange
        primary: {
          DEFAULT: "#FF6B35",
          light: "#FF8F65",
          dark: "#E55A2B",
          foreground: "#FFFFFF",
        },
        // Accent - Cyan
        accent: {
          DEFAULT: "#00D9FF",
          light: "#5CE5FF",
          dark: "#00B8D9",
          foreground: "#0A0A0F",
        },
        // Surface - Glassmorphism
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          hover: "rgba(255, 255, 255, 0.08)",
          active: "rgba(255, 255, 255, 0.12)",
          border: "rgba(255, 255, 255, 0.1)",
        },
        // Status
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        sm: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
