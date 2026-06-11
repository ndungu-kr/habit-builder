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

function MissedAcknowledge({
  missedHabits,
  streakValue,
  freezesAvailable,
  onUseFreeze,
  onLetReset,
}: {
  missedHabits: { habitName: string; habitColor: string; kind: 'missed' | 'skipped' }[];
  streakValue: number;
  freezesAvailable: number;
  onUseFreeze: () => void;
  onLetReset: () => void;
}) {
  const { colors } = useTheme();

  // Format yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <MDStepHeader current={1} total={3} />

      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={[styles.eyebrow, { color: colors.missed }]}>
          Yesterday - {dateStr}
        </Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Yesterday didn't go as planned.
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Everyone misses days. What matters is that you're here now.
        </Text>
      </View>

      {/* What was missed */}
      <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
        <View style={[styles.trackedCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.trackedLabel, { color: colors.textSecondary }]}>
            What we tracked
          </Text>
          <View style={{ gap: 8 }}>
            {missedHabits.map((h) => (
              <MissedHabitChip
                key={h.habitName}
                name={h.habitName}
                accent={h.habitColor}
                kind={h.kind}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Freeze decision - only if freezes available and streak > 0 */}
      {freezesAvailable > 0 && streakValue > 0 && (
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <View style={[styles.decisionCard, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '33' }]}>
            <View style={styles.decisionRow}>
              <View style={[styles.decisionIcon, { backgroundColor: colors.bg, borderColor: colors.accent }]}>
                <IconSnowflake size={22} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.decisionTitle, { color: colors.textPrimary }]}>
                  You have {freezesAvailable} streak freeze{freezesAvailable !== 1 ? 's' : ''}
                </Text>
                <Text style={[styles.decisionSub, { color: colors.textSecondary }]}>
                  Earned every 7 days you show up
                </Text>
              </View>
            </View>
            <Text style={[styles.decisionBody, { color: colors.textPrimary }]}>
              Use one to{' '}
              <Text style={{ fontFamily: 'Nunito_700Bold' }}>
                hold your {streakValue}-day streak at {streakValue}
              </Text>
              , or let it reset clean.
            </Text>
          </View>
        </View>
      )}

      <View style={{ flex: 1 }} />

      {/* Action buttons */}
      <View style={[styles.footerActions, { borderTopColor: colors.border }]}>
        {freezesAvailable > 0 && streakValue > 0 ? (
          <>
            <MDPrimaryCTA
              label="Use freeze"
              sub={`Your streak holds at ${streakValue}`}
              onPress={onUseFreeze}
            />
            <View style={{ height: 10 }} />
            <MDPrimaryCTA
              label="Let it reset"
              sub="Lifetime stats stay"
              onPress={onLetReset}
              dim
            />
          </>
        ) : (
          <MDPrimaryCTA
            label="Start fresh"
            sub="Your lifetime stats stay with you"
            onPress={onLetReset}
          />
        )}
      </View>
    </View>
  );
}