import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Circle, Path, G as SvgG, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useStreakStore } from '@/stores/streakStore';
import { IconFlame, IconSnowflake } from '@/components/Icons';

// Progress dots - no close button, this flow is mandatory
function MDStepHeader({
  current,
  total,
  light = false,
}: {
  current: number;
  total: number;
  light?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.stepHeader}>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i + 1 === current ? 22 : 6,
                backgroundColor:
                  i + 1 <= current
                    ? light ? '#fff' : colors.accent
                    : light ? 'rgba(255,255,255,0.25)' : colors.surfaceAlt,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function MDPrimaryCTA({
  label,
  sub,
  onPress,
  light = false,
  dim = false,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  light?: boolean;
  dim?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.primaryCta,
        {
          backgroundColor: light ? '#fff' : dim ? colors.surfaceAlt : colors.accent,
          shadowOpacity: dim ? 0 : 0.3,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.primaryCtaLabel,
          { color: light ? colors.accent : dim ? colors.textSecondary : '#fff' },
        ]}
      >
        {label}
      </Text>
      {sub && (
        <Text
          style={[
            styles.primaryCtaSub,
            {
              color: light
                ? 'rgba(0,0,0,0.55)'
                : dim
                ? colors.textTertiary
                : 'rgba(255,255,255,0.75)',
            },
          ]}
        >
          {sub}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Chip showing a missed/skipped habit
function MissedHabitChip({
  name,
  accent,
  kind,
}: {
  name: string;
  accent: string;
  kind: 'missed' | 'skipped';
}) {
  const { colors } = useTheme();
  const chipColor = colors.missed;

  return (
    <View style={[styles.habitChip, { backgroundColor: colors.bg }]}>
      <View style={[styles.chipStrip, { backgroundColor: accent }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.chipName, { color: colors.textPrimary }]}>{name}</Text>
        <Text style={[styles.chipKind, { color: chipColor }]}>
          {kind === 'skipped' ? 'Skipped - intentional' : 'Missed'}
        </Text>
      </View>
      <View style={[styles.chipIcon, { borderColor: chipColor }]}>
        {kind === 'missed' ? (
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path d="M6 6l12 12M18 6L6 18" stroke={chipColor} strokeWidth={2.4} strokeLinecap="round" />
          </Svg>
        ) : (
          <Svg width={12} height={2} viewBox="0 0 12 2">
            <Path d="M1 1h10" stroke={chipColor} strokeWidth={2.4} strokeLinecap="round" />
          </Svg>
        )}
      </View>
    </View>
  );
}