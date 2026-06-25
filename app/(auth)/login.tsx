import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

// ─── Brand mark (terracotta sphere with halo) ───

function BrandMark({ size = 44 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: -8,
          left: -8,
          right: -8,
          bottom: -8,
          borderRadius: 999,
          backgroundColor: colors.accent + '33',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 999,
          backgroundColor: colors.accent,
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
        }}
      />
    </View>
  );
}

// ─── Hero background circles ───

function AuthHeroBg() {
  const { colors } = useTheme();
  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: colors.accent + '15',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -40,
          right: 40,
          width: 120,
          height: 120,
          borderRadius: 999,
          backgroundColor: colors.accent + '25',
        }}
      />
    </>
  );
}

// ─── Labeled input field ───

function AuthField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  rightAction,
  onRightAction,
  autoCapitalize = 'none',
  keyboardType = 'default',
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  rightAction?: string;
  onRightAction?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text
          style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 12,
            color: colors.textSecondary,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        {rightAction && (
          <TouchableOpacity onPress={onRightAction}>
            <Text
              style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 12.5,
                color: colors.accent,
                letterSpacing: -0.05,
              }}
            >
              {rightAction}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 14,
          paddingHorizontal: 16,
          borderWidth: 1.5,
          borderColor: focused ? colors.accent : 'transparent',
          minHeight: 52,
          justifyContent: 'center',
        }}
      >
        <TextInput
          style={{
            fontFamily: 'Nunito_600SemiBold',
            fontSize: 16,
            color: colors.textPrimary,
            letterSpacing: -0.05,
            padding: 0,
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

// ─── OAuth button ───

function OAuthButton({ provider }: { provider: 'apple' | 'google' }) {
  const { colors, isDark } = useTheme();
  const isApple = provider === 'apple';
  const bg = isApple ? (isDark ? '#fff' : '#111') : colors.surface;
  const fg = isApple ? (isDark ? '#111' : '#fff') : colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={() => Alert.alert('Coming soon', `${isApple ? 'Apple' : 'Google'} sign-in will be available in a future update.`)}
      style={{
        backgroundColor: bg,
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        minHeight: 52,
        borderWidth: isApple ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      {isApple ? (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill={fg}>
          <Path d="M17.05 12.04c-.03-2.79 2.28-4.13 2.38-4.2-1.3-1.9-3.32-2.16-4.04-2.19-1.72-.17-3.36 1.01-4.23 1.01-.88 0-2.21-.99-3.64-.96-1.87.03-3.6 1.09-4.56 2.77-1.95 3.38-.5 8.38 1.4 11.14.93 1.35 2.04 2.86 3.49 2.81 1.4-.06 1.93-.91 3.63-.91 1.68 0 2.17.91 3.64.88 1.5-.02 2.45-1.37 3.36-2.73 1.06-1.56 1.49-3.08 1.51-3.16-.03-.01-2.92-1.12-2.94-4.46zM14.4 4.07c.77-.93 1.29-2.23 1.15-3.51-1.11.04-2.46.74-3.26 1.67-.72.82-1.34 2.13-1.17 3.39 1.24.1 2.5-.63 3.28-1.55z" />
        </Svg>
      ) : (
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path fill="#EA4335" d="M12 5.04c1.92 0 3.62.66 4.97 1.95l3.71-3.71C18.33 1.06 15.43 0 12 0 7.32 0 3.25 2.69 1.28 6.61l4.34 3.36C6.69 6.86 9.13 5.04 12 5.04z" />
          <Path fill="#4285F4" d="M23.5 12.25c0-.84-.07-1.65-.21-2.43H12v4.6h6.46c-.28 1.49-1.13 2.75-2.4 3.6l3.86 3c2.25-2.08 3.58-5.14 3.58-8.77z" />
          <Path fill="#FBBC05" d="M5.62 14.36a7.32 7.32 0 010-4.72L1.28 6.28A11.97 11.97 0 000 12c0 1.92.45 3.75 1.28 5.39l4.34-3.03z" />
          <Path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.9l-3.86-3c-1.07.72-2.43 1.14-4.07 1.14-2.87 0-5.31-1.82-6.38-4.93l-4.34 3.03C3.25 21.31 7.32 24 12 24z" />
        </Svg>
      )}
      <Text
        style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: 15,
          color: fg,
          letterSpacing: -0.05,
        }}
      >
        Continue with {isApple ? 'Apple' : 'Google'}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Or divider ───

function OrDivider({ label = 'or continue with' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text
        style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: 11,
          color: colors.textTertiary,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}

// ─── Login screen ───

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
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, position: 'relative' }}>
          <AuthHeroBg />

          <View style={{ height: 50 }} />

          {/* Header */}
          <View style={{ paddingHorizontal: 28, paddingTop: 32 }}>
            <BrandMark />
            <Text
              style={{
                fontFamily: 'Nunito_800ExtraBold',
                fontSize: 32,
                color: colors.textPrimary,
                marginTop: 28,
                letterSpacing: -0.7,
                lineHeight: 35,
              }}
            >
              Welcome back.
            </Text>
            <Text
              style={{
                fontFamily: 'Nunito_500Medium',
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 8,
                lineHeight: 22,
              }}
            >
              Today is another chance to show up.
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View
              style={{
                marginHorizontal: 24,
                marginTop: 20,
                padding: 14,
                borderRadius: 12,
                backgroundColor: colors.missed + '20',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Nunito_600SemiBold',
                  fontSize: 13,
                  color: colors.missed,
                }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={{ paddingHorizontal: 24, paddingTop: 28, gap: 16 }}>
            <AuthField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <AuthField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              rightAction="Forgot?"
              onRightAction={() => Alert.alert('Reset password', 'Password reset will be available in a future update.')}
            />
          </View>

          {/* Sign in button */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{
                backgroundColor: colors.accent,
                borderRadius: 999,
                padding: 17,
                alignItems: 'center',
                opacity: isLoading ? 0.6 : 1,
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Nunito_700Bold',
                  fontSize: 16,
                  color: '#fff',
                  letterSpacing: -0.1,
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Or divider */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <OrDivider />
          </View>

          {/* OAuth buttons */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 10 }}>
            <OAuthButton provider="apple" />
            <OAuthButton provider="google" />
          </View>

          <View style={{ flex: 1 }} />

          {/* Footer */}
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <Link href="/(auth)/signup">
              <Text
                style={{
                  fontFamily: 'Nunito_600SemiBold',
                  fontSize: 14.5,
                  color: colors.textSecondary,
                  letterSpacing: -0.05,
                }}
              >
                New here?{' '}
                <Text style={{ color: colors.accent, fontFamily: 'Nunito_800ExtraBold' }}>
                  Create an account
                </Text>
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}