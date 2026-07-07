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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/providers/ThemeProvider';
import { useProfileStore } from '@/stores/profileStore';
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

function CameraIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z"
        stroke={color} strokeWidth={1.8} />
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
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.avatar_url) setAvatarUri(profile.avatar_url);
  }, [profile?.name, profile?.avatar_url]);

  const hasChanges = name.trim() !== originalName || avatarChanged;

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    setAvatarUri(result.assets[0].uri);
    setAvatarChanged(true);
  };

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setSaving(true);

    let newAvatarUrl = profile?.avatar_url ?? null;

    if (avatarChanged && avatarUri) {
      try {
        const response = await fetch(avatarUri);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        const base64Data = base64.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const fileName = `avatars/${user?.id}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('why-images')
          .upload(fileName, bytes, { contentType: 'image/jpeg' });

        if (uploadError) {
          Toast.show({ type: 'error', text1: 'Couldn\'t upload photo', text2: uploadError.message });
          setSaving(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('why-images')
          .getPublicUrl(fileName);
        newAvatarUrl = urlData.publicUrl;
      } catch (e: any) {
        Toast.show({ type: 'error', text1: 'Couldn\'t upload photo', text2: e.message });
        setSaving(false);
        return;
      }
    }

    const updates: any = { name: name.trim() };
    if (avatarChanged) updates.avatar_url = avatarUri ? newAvatarUrl : null;

    const error = await updateProfile(updates);
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
        <View style={{ width: 44 }} />
      </View>

      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} accessibilityLabel="Change profile photo" accessibilityRole="button">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="disk"
              transition={200}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.habitSage }]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}>
            <CameraIcon color="#fff" />
          </View>
        </TouchableOpacity>
        {avatarUri && (
          <TouchableOpacity
            onPress={() => { setAvatarUri(null); setAvatarChanged(true); }}
            style={{ marginTop: 10 }}
            accessibilityLabel="Remove profile photo"
            accessibilityRole="button"
          >
            <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.missed, letterSpacing: -0.1 }}>
              Remove photo
            </Text>
          </TouchableOpacity>
        )}
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

        <TouchableOpacity
          onPress={() => router.push('/change-password')}
          style={[styles.changePasswordBtn, { backgroundColor: colors.surface }]}
          activeOpacity={0.85}
          accessibilityLabel="Change password"
          accessibilityRole="button"
        >
          <Text style={[styles.changePasswordBtnText, { color: colors.accent }]}>
            Change password
          </Text>
        </TouchableOpacity>
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
  avatarWrap: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FAF8F5',
  },
  avatarText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 48,
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
  changePasswordBtn: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  changePasswordBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    letterSpacing: -0.1,
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