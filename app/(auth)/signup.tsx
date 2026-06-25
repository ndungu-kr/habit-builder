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
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import Svg, { Path, Circle } from 'react-native-svg';

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
  autoCapitalize = 'none',
  keyboardType = 'default',
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <View style={{ marginBottom: 8 }}>
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

// ─── Password strength meter ───

function PasswordStrength({ password }: { password: string }) {
  const { colors } = useTheme();

  let level = 0;
  if (password.length >= 4) level = 1;
  if (password.length >= 6) level = 2;
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) level = 3;

  const segments = [
    { color: colors.missed, label: 'Too short' },
    { color: colors.missed, label: 'Weak' },
    { color: colors.partial || colors.accent, label: 'Decent' },
    { color: colors.success || '#4CAF50', label: 'Strong' },
  ];
  const cur = segments[level];

  if (!password) return null;

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              backgroundColor: i <= level ? cur.color : colors.surfaceAlt,
            }}
          />
        ))}
      </View>
      <Text
        style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: 11.5,
          color: cur.color,
          marginTop: 6,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {cur.label}
      </Text>
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

function OrDivider({ label = 'or with email' }: { label?: string }) {
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

// ─── Terms checkbox ───

function TermsCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          backgroundColor: checked ? colors.accent : 'transparent',
          borderWidth: checked ? 0 : 1.5,
          borderColor: colors.textTertiary,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        {checked && (
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12l5 5L19 7"
              stroke="#fff"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
      <Text
        style={{
          fontFamily: 'Nunito_500Medium',
          fontSize: 13,
          color: colors.textSecondary,
          lineHeight: 20,
          flex: 1,
        }}
      >
        I agree to the{' '}
        <Text style={{ color: colors.textPrimary, fontFamily: 'Nunito_700Bold' }}>Terms</Text> and{' '}
        <Text style={{ color: colors.textPrimary, fontFamily: 'Nunito_700Bold' }}>Privacy Policy</Text>.
      </Text>
    </TouchableOpacity>
  );
}

// ─── Back button ───

function BackChevron() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
      }}
    >
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 6l-6 6 6 6"
          stroke={colors.textSecondary}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  );
}

// ─── Signup screen ───

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signUp, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms and Privacy Policy.');
      return;
    }

    const errorMessage = await signUp(email.trim(), password);
    if (errorMessage) {
      setError('Could not create account. Please try again.');
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

          {/* Header with back button */}
          <View style={{ paddingHorizontal: 28, paddingTop: 20 }}>
            <BackChevron />
            <Text
              style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 11.5,
                color: colors.accent,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              Begin
            </Text>
            <Text
              style={{
                fontFamily: 'Nunito_800ExtraBold',
                fontSize: 30,
                color: colors.textPrimary,
                marginTop: 6,
                letterSpacing: -0.7,
                lineHeight: 33,
              }}
            >
              Create your account.
            </Text>
            <Text
              style={{
                fontFamily: 'Nunito_500Medium',
                fontSize: 14.5,
                color: colors.textSecondary,
                marginTop: 8,
                lineHeight: 22,
              }}
            >
              The whole loop - pledge, do, reflect - is private to you.
            </Text>
          </View>

          {/* OAuth first */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24, gap: 10 }}>
            <OAuthButton provider="apple" />
            <OAuthButton provider="google" />
          </View>

          {/* Or divider */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <OrDivider />
          </View>

          {/* Error */}
          {error && (
            <View
              style={{
                marginHorizontal: 24,
                marginTop: 16,
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
          <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 14 }}>
            <AuthField
              label="Your name"
              placeholder="What should we call you?"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <AuthField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <View>
              <AuthField
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <PasswordStrength password={password} />
            </View>
          </View>

          {/* Terms */}
          <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
            <TermsCheckbox
              checked={termsAccepted}
              onToggle={() => setTermsAccepted(!termsAccepted)}
            />
          </View>

          {/* Create account button */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <TouchableOpacity
              onPress={handleSignup}
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
                {isLoading ? 'Creating account...' : 'Create account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />

          {/* Footer */}
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <Link href="/(auth)/login">
              <Text
                style={{
                  fontFamily: 'Nunito_600SemiBold',
                  fontSize: 14,
                  color: colors.textSecondary,
                  letterSpacing: -0.05,
                }}
              >
                Have an account?{' '}
                <Text style={{ color: colors.accent, fontFamily: 'Nunito_800ExtraBold' }}>
                  Sign in
                </Text>
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}