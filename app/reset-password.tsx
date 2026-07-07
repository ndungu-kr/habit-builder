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
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import Toast from 'react-native-toast-message';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { updatePassword } = useAuthStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleReset = async () => {
    setError(null);
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    const err = await updatePassword(newPassword);
    setSaving(false);
    if (err) {
      setError(err);
    } else {
      Toast.show({ type: 'success', text1: 'Password updated' });
      router.replace('/(tabs)');
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

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Set new password
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose a strong password you haven't used before.
          </Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.missed + '20' }]}>
              <Text style={[styles.errorText, { color: colors.missed }]}>{error}</Text>
            </View>
          )}

          <View style={{ marginTop: 28, gap: 16 }}>
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
                CONFIRM PASSWORD
              </Text>
              <View style={[
                styles.fieldInput,
                { backgroundColor: colors.surface, borderColor: focusedField === 'confirm' ? colors.accent : 'transparent' },
              ]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Re-enter your new password"
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
            onPress={handleReset}
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
  content: {
    paddingHorizontal: 28,
    paddingTop: 32,
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