import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { typography } from '@/theme/typography';
import { spacing, radii, layout } from '@/theme/spacing';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const errorMessage = await signIn(email.trim(), password);
    if (errorMessage) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to continue your journey
          </Text>
        </View>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.missed + '20' }]}>
            <Text style={[styles.errorText, { color: colors.missed }]}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
            }]}
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
            }]}
            placeholder="Password"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent, opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing in...' : 'Log In'}
            </Text>
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/signup" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.textSecondary }]}>
            Don't have an account? <Text style={{ color: colors.accent }}>Sign up</Text>
          </Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  header: {
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: radii.input,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.caption,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    ...typography.body,
    padding: spacing.lg,
    borderRadius: radii.input,
    borderWidth: 1,
  },
  button: {
    padding: spacing.lg,
    borderRadius: radii.button,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  link: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
  },
  linkText: {
    ...typography.caption,
  },
});