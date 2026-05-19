import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorTokens } from '@/theme/colors';

// Define the shape of what the theme context provides
// Any component that calls useTheme() gets these two values
type ThemeContextType = {
  colors: ColorTokens;  // The active color set (light or dark)
  isDark: boolean;       // Handy boolean for conditional styling
};

// Create the context with a default value
// This default is only used if a component somehow renders outside the provider
// (shouldn't happen, but TypeScript requires a default)
const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
});

// The provider component - wraps the entire app in _layout.tsx
// It reads the system color scheme and passes the right colors down
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useColorScheme() returns 'light', 'dark', or null
  // This updates automatically when the user toggles their phone's dark mode
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// The hook that screens and components use to access theme colors
// Usage: const { colors, isDark } = useTheme();
export function useTheme() {
  return useContext(ThemeContext);
}