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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useWhyStore } from '@/stores/whyStore';
import Svg, { Path } from 'react-native-svg';

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
  const { addWhy } = useWhyStore();
  const params = useLocalSearchParams<{ habitId: string; habitName: string }>();
  const habitId = params.habitId || '';
  const habitName = params.habitName || 'this habit';

  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors.whyCardColors[0]);
  const [saving, setSaving] = useState(false);

  const canSave = text.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    await addWhy(habitId, text.trim(), selectedColor);
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