import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useWhyStore } from '@/stores/whyStore';
import Svg, { Path } from 'react-native-svg';

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function WhyDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { updateWhy, deleteWhy } = useWhyStore();

  const params = useLocalSearchParams<{
    whyId: string;
    habitId: string;
    type: string;
    textContent: string;
    imageUrl: string;
    caption: string;
    color: string;
    aspectRatio: string;
  }>();

  const whyId = params.whyId || '';
  const habitId = params.habitId || '';
  const type = params.type || 'text';
  const imageUrl = params.imageUrl || '';
  const initialColor = params.color || colors.whyCardColors[0];

  const [text, setText] = useState(params.textContent || '');
  const [caption, setCaption] = useState(params.caption || '');
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    (type === 'text' && (text !== (params.textContent || '') || selectedColor !== initialColor)) ||
    (type === 'image' && (caption !== (params.caption || '') || selectedColor !== initialColor));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    if (type === 'text') {
      await updateWhy(whyId, habitId, { text_content: text.trim(), color: selectedColor });
    } else {
      await updateWhy(whyId, habitId, { caption: caption.trim() || null, color: selectedColor });
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete this why?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWhy(whyId, habitId);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <CloseIcon color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: colors.surface }]}
          onPress={handleDelete}
        >
          <TrashIcon color={colors.missed} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {type === 'image' && imageUrl ? (
          <>
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: imageUrl }}
                style={[styles.fullImage, { aspectRatio: Number(params.aspectRatio) || 3 / 4 }]}
                resizeMode="cover"
              />
            </View>

            <View style={[styles.fieldWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Caption</Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.textPrimary }]}
                placeholder="Add a caption..."
                placeholderTextColor={colors.textTertiary}
                value={caption}
                onChangeText={setCaption}
                maxLength={120}
                multiline
              />
            </View>
          </>
        ) : (
          <>
            <View style={[styles.textCard, { backgroundColor: selectedColor }]}>
              <Text style={styles.textQuote}>"</Text>
              <Text style={styles.textContent}>{text || 'Your why'}</Text>
            </View>

            <View style={[styles.fieldWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Your why</Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.textPrimary }]}
                placeholder="Why does this matter?"
                placeholderTextColor={colors.textTertiary}
                value={text}
                onChangeText={setText}
                maxLength={500}
                multiline
              />
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {text.length}/500
              </Text>
            </View>
          </>
        )}

        {/* Color picker - text whys only */}
        {type === 'text' && (
          <>
        <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>
          Card color
        </Text>
        <View style={styles.colorRow}>
          {colors.whyCardColors.map((c: string) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                selectedColor === c && styles.colorSwatchSelected,
                selectedColor === c && { borderColor: colors.textPrimary },
              ]}
              onPress={() => setSelectedColor(c)}
            />
          ))}
        </View>
          </>
        )}
      </ScrollView>

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
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  imageWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  fullImage: {
    width: '100%',
    borderRadius: 20,
  },
  textCard: {
    borderRadius: 20,
    padding: 36,
    paddingHorizontal: 28,
    minHeight: 220,
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  textQuote: {
    position: 'absolute',
    top: 14,
    left: 18,
    fontFamily: 'Nunito_700Bold',
    fontSize: 64,
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 64,
  },
  textContent: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 22,
    color: '#fff',
    lineHeight: 30,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  fieldWrap: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  fieldInput: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 40,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  colorLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSwatchSelected: {
    borderWidth: 3,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
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