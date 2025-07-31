// Taste of Peshawar Color Theme
// Updated with #e34691 as primary color

export const Colors = {
  // Primary Brand Colors - Based on #e34691
  primary: {
    50: "#fdf2f8",
    100: "#fce7f3",
    200: "#fbcfe8",
    300: "#f9a8d4",
    400: "#f472b6",
    500: "#e34691", // Main brand color - vibrant pink/magenta
    600: "#db2777",
    700: "#be185d",
    800: "#9d174d",
    900: "#831843",
  },

  // Secondary Colors - Complementary teal/cyan
  secondary: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4", // Complementary teal
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },

  // Accent Colors - Warm coral/orange
  accent: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316", // Warm coral
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },

  // Success Colors - Fresh Green
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // Fresh green
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Warning Colors - Warm Amber
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // Warm amber
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Error Colors - Rich Red
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // Rich red
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Neutral Colors - Cool Grays
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  // Background Colors
  background: {
    primary: "#fdf2f8", // Light pink tint
    secondary: "#ffffff",
    tertiary: "#ecfeff", // Light teal tint
    card: "#ffffff",
    modal: "#ffffff",
  },

  // Text Colors
  text: {
    primary: "#0f172a", // Dark slate
    secondary: "#475569", // Medium slate
    tertiary: "#64748b", // Light slate
    inverse: "#ffffff",
    muted: "#94a3b8",
  },

  // Border Colors
  border: {
    light: "#e2e8f0",
    medium: "#cbd5e1",
    dark: "#94a3b8",
  },

  // Special Colors for Restaurant Theme
  restaurant: {
    spice: "#e34691", // Main spice color (primary)
    saffron: "#f97316", // Warm saffron
    cardamom: "#22c55e", // Fresh cardamom
    cinnamon: "#dc2626", // Rich cinnamon
    turmeric: "#fbbf24", // Golden turmeric
    paprika: "#ef4444", // Vibrant paprika
    coriander: "#06b6d4", // Fresh coriander (secondary)
    cumin: "#8b5cf6", // Deep cumin
  },
};

// Theme configuration
export const Theme = {
  colors: Colors,

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Typography
  typography: {
    fontFamily: {
      primary: "System",
      secondary: "System",
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// Utility functions for theme
export const getColor = (colorPath: string) => {
  const path = colorPath.split(".");
  let current: any = Colors;

  for (const key of path) {
    if (current[key] !== undefined) {
      current = current[key];
    } else {
      return Colors.primary[500]; // Fallback color
    }
  }

  return current;
};

// Common color combinations
export const ColorSchemes = {
  primary: {
    background: Colors.background.primary,
    text: Colors.text.primary,
    accent: Colors.primary[500],
  },
  secondary: {
    background: Colors.background.secondary,
    text: Colors.text.primary,
    accent: Colors.secondary[500],
  },
  success: {
    background: Colors.success[50],
    text: Colors.success[700],
    accent: Colors.success[500],
  },
  warning: {
    background: Colors.warning[50],
    text: Colors.warning[700],
    accent: Colors.warning[500],
  },
  error: {
    background: Colors.error[50],
    text: Colors.error[700],
    accent: Colors.error[500],
  },
};
