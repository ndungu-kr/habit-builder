import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/providers/ThemeProvider';
import { useWhyStore } from '@/stores/whyStore';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18"
        stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function AddWhyScreen() {
  const { colors } = useTheme();
  const { addWhy, addImageWhy } = useWhyStore();
  const params = useLocalSearchParams<{ habitId: string; habitName: string }>();
  const habitId = params.habitId || '';
  const habitName = params.habitName || 'this habit';

  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors.whyCardColors[0]);
  const [saving, setSaving] = useState(false);

  const canSave = mode === 'text' ? text.trim().length > 0 : imageUri !== null;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    if (mode === 'text') {
      await addWhy(habitId, text.trim(), selectedColor);
    } else {
      await addImageWhy(habitId, imageUri!, caption.trim(), selectedColor);
    }
    router.back();
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Add a why
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Context */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Why does {habitName} matter to you? This will show up when you pledge.
        </Text>

        {/* Text / Image toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={() => setMode('text')}
            style={[
              styles.modeBtn,
              mode === 'text' && { backgroundColor: colors.bg },
            ]}
          >
            <Text style={[
              styles.modeBtnText,
              { color: mode === 'text' ? colors.textPrimary : colors.textSecondary },
            ]}>
              Text
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('image')}
            style={[
              styles.modeBtn,
              mode === 'image' && { backgroundColor: colors.bg },
            ]}
          >
            <Text style={[
              styles.modeBtnText,
              { color: mode === 'image' ? colors.textPrimary : colors.textSecondary },
            ]}>
              Image
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'text' ? (
          <>
            {/* Preview card */}
            <View style={[styles.previewCard, { backgroundColor: selectedColor }]}>
              <Text style={styles.previewQuote}>"</Text>
              <Text style={styles.previewText}>
                {text || 'Your why will appear here...'}
              </Text>
            </View>

            {/* Text input */}
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="e.g. To be calmer and more present for the people I love."
                placeholderTextColor={colors.textTertiary}
                multiline
                maxLength={200}
                value={text}
                onChangeText={setText}
                autoFocus
              />
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {text.length}/200
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Image preview or picker */}
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              style={[styles.imagePickerCard, { backgroundColor: selectedColor }]}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <View style={styles.cameraIconWrap}>
                    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                      <Rect x={3} y={6} width={18} height={14} rx={2.5} stroke="#fff" strokeWidth={1.8} />
                      <Circle cx={12} cy={13.5} r={3.5} stroke="#fff" strokeWidth={1.8} />
                      <Path d="M9 6l1.5-2h3L15 6" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={styles.imagePickerLabel}>Tap to choose a photo</Text>
                </View>
              )}
              {imageUri && caption ? (
                <View style={styles.captionOverlay}>
                  <Text style={styles.captionText}>{caption}</Text>
                </View>
              ) : null}
            </TouchableOpacity>

            {imageUri && (
              <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.accent }}>
                  Change photo
                </Text>
              </TouchableOpacity>
            )}

            {/* Caption input */}
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, minHeight: 40 }]}
                placeholder="Add a caption (optional)"
                placeholderTextColor={colors.textTertiary}
                maxLength={120}
                value={caption}
                onChangeText={setCaption}
              />
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {caption.length}/120
              </Text>
            </View>
          </>
        )}

        {/* Color picker */}
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
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: canSave ? colors.accent : colors.surfaceAlt },
          ]}
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.85}
        >
          <Text style={[
            styles.saveBtnText,
            { color: canSave ? '#fff' : colors.textTertiary },
          ]}>
            {saving ? 'Saving...' : 'Save why'}
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    letterSpacing: -0.1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  previewCard: {
    borderRadius: 20,
    padding: 36,
    paddingHorizontal: 28,
    minHeight: 180,
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewQuote: {
    position: 'absolute',
    top: 14,
    left: 18,
    fontFamily: 'Nunito_700Bold',
    fontSize: 64,
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 64,
  },
  previewText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 20,
    color: '#fff',
    lineHeight: 28,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  inputWrap: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  input: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 60,
    textAlignVertical: 'top',
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
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  imagePickerCard: {
    borderRadius: 20,
    minHeight: 260,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 300,
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 40,
  },
  cameraIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  captionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  captionText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
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
    letterSpacing: -0.1,
  },
});