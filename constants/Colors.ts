// Taste of Peshawar Color Theme
// Inspired by the rich colors of Peshawar cuisine and culture

export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#fef7ed',
    100: '#fdedd4',
    200: '#fbd7a9',
    300: '#f8bb72',
    400: '#f5953a',
    500: '#f37a1d', // Main brand color - warm orange
    600: '#e45f12',
    700: '#bd4711',
    800: '#963a15',
    900: '#7a3215',
  },

  // Secondary Colors - Spice-inspired
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Vibrant purple
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },

  // Accent Colors - Gold and Amber
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Golden amber
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Success Colors - Fresh Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Fresh green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning Colors - Warm Orange
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Warm orange
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error Colors - Rich Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Rich red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral Colors - Warm Grays
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },

  // Background Colors
  background: {
    primary: '#fef7ed', // Warm cream
    secondary: '#ffffff',
    tertiary: '#fdf4ff',
    card: '#ffffff',
    modal: '#ffffff',
  },

  // Text Colors
  text: {
    primary: '#1c1917', // Dark brown
    secondary: '#57534e', // Medium gray
    tertiary: '#78716c', // Light gray
    inverse: '#ffffff',
    muted: '#a8a29e',
  },

  // Border Colors
  border: {
    light: '#e7e5e4',
    medium: '#d6d3d1',
    dark: '#a8a29e',
  },

  // Special Colors for Restaurant Theme
  restaurant: {
    spice: '#f37a1d', // Main spice color
    saffron: '#f59e0b', // Saffron gold
    cardamom: '#22c55e', // Fresh cardamom
    cinnamon: '#dc2626', // Rich cinnamon
    turmeric: '#fbbf24', // Golden turmeric
    paprika: '#ef4444', // Vibrant paprika
    coriander: '#10b981', // Fresh coriander
    cumin: '#8b5cf6', // Deep cumin
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
      primary: 'System',
      secondary: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// Utility functions for theme
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.');
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
