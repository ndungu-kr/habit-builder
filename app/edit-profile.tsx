import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';
import { useProfileStore } from '@/stores/profileStore';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/stores/authStore';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M15 6l-6 6 6 6" stroke={color}
        strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { profile, updateProfile } = useProfileStore();
  const { user } = useAuthStore();

  const email = user?.email ?? '';
  const originalName = profile?.name ?? '';

  const [name, setName] = useState(originalName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile?.name]);

  const hasChanges = name.trim() !== originalName;

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setSaving(true);
    const error = await updateProfile({ name: name.trim() });
    if (error) {
      Toast.show({ type: 'error', text1: 'Couldn\'t update profile', text2: error });
      setSaving(false);
      return;
    }
    Toast.show({ type: 'success', text1: 'Profile updated' });
    router.back();
  };

  const initial = (name || email.split('@')[0] || 'U').charAt(0).toUpperCase();

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <BackIcon color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Edit profile
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: colors.habitSage }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>

      {/* Name field */}
      <View style={styles.fieldsWrap}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Name</Text>
        <View style={[styles.fieldInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textTertiary}
            maxLength={50}
            autoCapitalize="words"
          />
        </View>

        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 20 }]}>Email</Text>
        <View style={[styles.fieldInput, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.6 }]}>
          <Text style={[styles.input, { color: colors.textSecondary }]}>{email}</Text>
        </View>
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
          Email cannot be changed
        </Text>
      </View>
      </Pressable>

      {/* Save button */}
      {hasChanges && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.accent }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving...' : 'Save changes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    letterSpacing: -0.1,
  },
  avatarWrap: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    color: '#fff',
    letterSpacing: -0.5,
  },
  fieldsWrap: {
    paddingHorizontal: 24,
  },
  fieldLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  fieldInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
  },
  fieldHint: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    marginTop: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  saveBtn: {
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: -0.1,
  },
});