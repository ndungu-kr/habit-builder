import Toast, { toastConfig } from '@/components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';

function RootLayoutNav() {
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const { session, initialized } = useAuthStore();
  const [routingReady, setRoutingReady] = useState(false);

  // Use stable primitives so token refreshes don't re-trigger routing
  const isLoggedIn = !!session;
  const userId = session?.user?.id;

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Not logged in - send to auth
    if (!isLoggedIn) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      setRoutingReady(true);
      return;
    }

    // Only check onboarding flag for routes that need guarding
    // Auth screens (just logged in) and tabs (cold launch)
    if (!inAuthGroup && segments[0] !== '(tabs)') {
      setRoutingReady(true);
      return;
    }

    // Async check - only runs for auth and tabs routes
    const checkOnboarding = async () => {
      const flag = await SecureStore.getItemAsync(`onboarding_done_${userId}`);
      const onboardingDone = flag === 'true';

      if (inAuthGroup) {
        router.replace(onboardingDone ? '/(tabs)' : '/onboarding');
      } else if (!onboardingDone) {
        router.replace('/onboarding');
      }

      setRoutingReady(true);
    };

    checkOnboarding();
  }, [isLoggedIn, userId, initialized, segments]);

  if (!initialized || (isLoggedIn && !routingReady)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutNav />
        <Toast config={toastConfig} position="top" topOffset={60} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}