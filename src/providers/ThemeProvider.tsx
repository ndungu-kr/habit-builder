import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorTokens } from '@/theme/colors';
import { useProfileStore } from '@/stores/profileStore';
import { ThemeMode } from '@/types';
import { StatusBar } from 'expo-status-bar';

// Define the shape of what the theme context provides
// Any component that calls useTheme() gets these two values
type ThemeContextType = {
  colors: ColorTokens;  // The active color set (light or dark)
  isDark: boolean;       // Handy boolean for conditional styling
};

// Create the context with a default value
// This default is only used if a component somehow renders outside the provider
const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
});

// The provider component - wraps the entire app in _layout.tsx
// Now reads BOTH the system color scheme AND the user's saved preference
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useColorScheme() returns 'light', 'dark', or null from the device
  const systemScheme = useColorScheme();

  // Read the user's theme preference from their profile in the database
  // This updates reactively whenever the profile changes (e.g. toggling in settings)
  const profile = useProfileStore((state) => state.profile);

  // Default to 'system' if no profile is loaded yet (first app open, loading state)
  const themePref: ThemeMode = profile?.theme ?? 'system';

  // Resolve the final dark/light decision:
  // - 'dark' -> always dark, regardless of device setting
  // - 'light' -> always light, regardless of device setting
  // - 'system' -> follow whatever the phone is set to
  const isDark =
    themePref === 'dark'
      ? true
      : themePref === 'light'
      ? false
      : systemScheme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  // 'light' style = white icons (for dark backgrounds)
  // 'dark' style = black icons (for light backgrounds)
  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

// The hook that screens and components use to access theme colors
// Usage: const { colors, isDark } = useTheme();
export function useTheme() {
  return useContext(ThemeContext);
}