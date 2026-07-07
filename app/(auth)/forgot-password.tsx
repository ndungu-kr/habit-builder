import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M15 6l-6 6 6 6" stroke={color}
        strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { resetPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  // OTP step
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  const handleSend = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setSending(true);
    const err = await resetPassword(email.trim());
    setSending(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp.trim()) {
      setError('Please enter the code from your email.');
      return;
    }
    setVerifying(true);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'recovery',
    });
    setVerifying(false);
    if (otpError) {
      setError('Invalid or expired code. Please try again.');
    } else {
      router.replace('/reset-password');
    }
  };

  const handleResend = async () => {
    setError(null);
    setSending(true);
    const err = await resetPassword(email.trim());
    setSending(false);
    if (err) {
      setError(err);
    } else {
      Toast.show({ type: 'success', text1: 'Code resent' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ height: 50 }} />

        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <BackIcon color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {sent ? 'Check your email' : 'Reset password'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {sent
              ? `We sent a verification code to ${email}. Enter it below to reset your password.`
              : "Enter the email you signed up with and we'll send you a verification code."}
          </Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.missed + '20' }]}>
              <Text style={[styles.errorText, { color: colors.missed }]}>{error}</Text>
            </View>
          )}

          {sent ? (
            <View style={{ marginTop: 28 }}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                VERIFICATION CODE
              </Text>
              <View style={[
                styles.fieldInput,
                { backgroundColor: colors.surface, borderColor: otpFocused ? colors.accent : 'transparent' },
              ]}>
                <TextInput
                  style={[styles.otpInput, { color: colors.textPrimary }]}
                  placeholderTextColor={colors.textTertiary}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={8}
                  autoFocus
                  onFocus={() => setOtpFocused(true)}
                  onBlur={() => setOtpFocused(false)}
                />
              </View>

              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={verifying}
                style={[styles.sendBtn, {
                  backgroundColor: colors.accent,
                  opacity: verifying ? 0.6 : 1,
                }]}
              >
                <Text style={styles.sendBtnText}>
                  {verifying ? 'Verifying...' : 'Verify code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResend}
                disabled={sending}
                style={{ alignItems: 'center', marginTop: 20 }}
              >
                <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.accent, letterSpacing: -0.1 }}>
                  {sending ? 'Sending...' : "Didn't get it? Resend code"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{ marginTop: 28 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  EMAIL
                </Text>
                <View style={[
                  styles.fieldInput,
                  { backgroundColor: colors.surface, borderColor: focused ? colors.accent : 'transparent' },
                ]}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSend}
                disabled={sending}
                style={[styles.sendBtn, {
                  backgroundColor: colors.accent,
                  opacity: sending ? 0.6 : 1,
                }]}
              >
                <Text style={styles.sendBtnText}>
                  {sending ? 'Sending...' : 'Send verification code'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  errorBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
  },
  fieldLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  fieldInput: {
    borderRadius: 12,
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    minHeight: 52,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.05,
    padding: 0,
  },
  otpInput: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    padding: 0,
  },
  sendBtn: {
    borderRadius: 999,
    padding: 17,
    alignItems: 'center',
    marginTop: 24,
  },
  sendBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.1,
  },
});