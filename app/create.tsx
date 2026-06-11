import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, radii } from '@/theme/spacing';
import { useHabitStore } from '@/stores/habitStore';
import { IconCheck, IconPlus } from '@/components/Icons';
import { ScheduleType, Weekday, GoalUnit } from '@/types';

const TOTAL_STEPS = 6;

const DAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

// Shared step header - close button, progress dots, step counter
function StepHeader({
  current,
  onClose,
}: {
  current: number;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.stepHeader}>
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: colors.surface }]}
        onPress={onClose}
      >
        <Text style={[styles.closeX, { color: colors.textSecondary }]}>✕</Text>
      </TouchableOpacity>
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i + 1 <= current ? 22 : 6,
                backgroundColor: i + 1 <= current ? colors.accent : colors.surfaceAlt,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.stepCount, { color: colors.textSecondary }]}>
        {current} / {TOTAL_STEPS}
      </Text>
    </View>
  );
}

// Reusable step title with eyebrow, headline, subtitle
function StepTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.stepTitle}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text>
      <Text style={[styles.titleText, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// Bottom bar with primary CTA button
function FooterBar({
  label,
  onPress,
  disabled = false,
  ghost = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  ghost?: boolean;
}) {
  const { colors } = useTheme();

  if (ghost) {
    return (
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.ghostButton} onPress={onPress}>
          <Text style={[styles.ghostButtonText, { color: colors.textSecondary }]}>
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      <TouchableOpacity
        style={[
          styles.ctaButton,
          { backgroundColor: disabled ? colors.surfaceAlt : colors.accent },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text
          style={[
            styles.ctaText,
            { color: disabled ? colors.textTertiary : '#fff' },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}