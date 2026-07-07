import { useState } from 'react';
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

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, updatePassword } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = async () => {
    setError(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setSaving(true);

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: currentPassword,
    });

    if (signInError) {
      setSaving(false);
      setError('Current password is incorrect.');
      return;
    }

    const err = await updatePassword(newPassword);
    setSaving(false);

    if (err) {
      setError(err);
    } else {
      Toast.show({ type: 'success', text1: 'Password changed' });
      router.back();
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <BackIcon color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Change password
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.missed + '20' }]}>
              <Text style={[styles.errorText, { color: colors.missed }]}>{error}</Text>
            </View>
          )}

          <View style={{ gap: 16 }}>
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                CURRENT PASSWORD
              </Text>
              <View style={[
                styles.fieldInput,
                { backgroundColor: colors.surface, borderColor: focusedField === 'current' ? colors.accent : 'transparent' },
              ]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textTertiary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  onFocus={() => setFocusedField('current')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                NEW PASSWORD
              </Text>
              <View style={[
                styles.fieldInput,
                { backgroundColor: colors.surface, borderColor: focusedField === 'new' ? colors.accent : 'transparent' },
              ]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textTertiary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  onFocus={() => setFocusedField('new')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                CONFIRM NEW PASSWORD
              </Text>
              <View style={[
                styles.fieldInput,
                { backgroundColor: colors.surface, borderColor: focusedField === 'confirm' ? colors.accent : 'transparent' },
              ]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleChange}
            disabled={saving}
            style={[styles.saveBtn, {
              backgroundColor: colors.accent,
              opacity: saving ? 0.6 : 1,
            }]}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Updating...' : 'Update password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    letterSpacing: -0.1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  errorBox: {
    marginBottom: 20,
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
  divider: {
    height: 1,
    marginVertical: 4,
  },
  saveBtn: {
    borderRadius: 999,
    padding: 17,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.1,
  },
});