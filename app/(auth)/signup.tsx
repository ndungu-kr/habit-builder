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

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signUp, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);

    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const errorMessage = await signUp(email.trim(), password);
    if (errorMessage) {
      setError('Could not create account. Please try again.');
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
            Start your journey
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create an account to begin building habits
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
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
            }]}
            placeholder="Confirm password"
            placeholderTextColor={colors.textTertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent, opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.textSecondary }]}>
            Already have an account? <Text style={{ color: colors.accent }}>Log in</Text>
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