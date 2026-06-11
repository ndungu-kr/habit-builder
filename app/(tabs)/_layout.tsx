import { Tabs } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { IconHome, IconChart, IconGear } from '@/components/Icons';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          paddingBottom: 28, // room for home indicator
          paddingTop: 8,
          height: 84,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito_600SemiBold',
          fontSize: 11,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <IconHome size={24} color={color} filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color, focused }) => (
            <IconChart size={24} color={color} filled={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <IconGear size={24} color={color} filled={focused} />
          ),
        }}
      />
    </Tabs>
  );
}