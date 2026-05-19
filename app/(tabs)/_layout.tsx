import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme/typography';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          ...typography.small,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}