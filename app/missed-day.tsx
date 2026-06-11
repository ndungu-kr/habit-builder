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

function MissedFreezeUsed({
  streakValue,
  freezesRemaining,
  onContinue,
}: {
  streakValue: number;
  freezesRemaining: number;
  onContinue: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <MDStepHeader current={2} total={3} />

      <View style={styles.centerContent}>
        {/* Snowflake medallion */}
        <View style={[styles.medallionOuter, { backgroundColor: colors.accentSoft }]}>
          <View style={[styles.medallionInner, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
            <IconSnowflake size={38} color={colors.accent} />
          </View>
        </View>

        <Text style={[styles.bigTitle, { color: colors.textPrimary }]}>
          Your streak holds at {streakValue}.
        </Text>
        <Text style={[styles.bigSub, { color: colors.textSecondary }]}>
          The freeze holds your streak in place because you didn't do the work yesterday. Today, let's pick back up.
        </Text>

        {/* Balance card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.balanceLeft, { borderRightColor: colors.border }]}>
            <IconFlame size={18} color={colors.accent} />
            <Text style={[styles.balanceStreak, { color: colors.accent }]}>{streakValue}</Text>
          </View>
          <View style={styles.balanceRight}>
            <IconSnowflake size={16} color={colors.textSecondary} />
            <Text style={[styles.balanceFreeze, { color: colors.textSecondary }]}>
              {freezesRemaining} / 3 remaining
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <MDPrimaryCTA label="Now, today's pledge" onPress={onContinue} />
      </View>
    </View>
  );
}

// Sunrise SVG for the reset screen
function SunriseIcon() {
  return (
    <Svg width={50} height={50} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={30} r={9} fill="#fff" opacity={0.95} />
      <SvgG stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.85}>
        <Path d="M24 12v4" />
        <Path d="M12 28h4" />
        <Path d="M32 28h4" />
        <Path d="M15 18l2.5 2.5" />
        <Path d="M33 20.5L30.5 18" />
      </SvgG>
      <Path d="M8 38h32" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

function MissedReset({ onContinue }: { onContinue: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <MDStepHeader current={2} total={3} />

      <View style={styles.centerContent}>
        <View style={[styles.sunriseCircle, { backgroundColor: colors.accent }]}>
          <SunriseIcon />
        </View>

        <Text style={[styles.bigTitle, { color: colors.textPrimary }]}>
          Today is Day 1 of something new.
        </Text>
        <Text style={[styles.bigSub, { color: colors.textSecondary }]}>
          Your streak resets, but what you've built doesn't go away.
        </Text>

        {/* Lifetime stats card */}
        <View style={[styles.lifetimeCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.lifetimeLabel, { color: colors.textSecondary }]}>
            What stays with you
          </Text>
          <View style={styles.lifetimeGrid}>
            <View>
              <Text style={[styles.lifetimeStat, { color: colors.textPrimary }]}>-</Text>
              <Text style={[styles.lifetimeCaption, { color: colors.textSecondary }]}>
                Days shown up
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <MDPrimaryCTA label="Begin Day 1" onPress={onContinue} />
      </View>
    </View>
  );
}

// Arrow forward SVG
function ArrowForward() {
  return (
    <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function MissedTransition({ onGo }: { onGo: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.transitionBg, { backgroundColor: colors.accent }]}>
      {/* Soft rings */}
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      <View style={{ height: 50 }} />
      <MDStepHeader current={3} total={3} light />

      <View style={styles.centerContent}>
        <View style={styles.arrowCircle}>
          <ArrowForward />
        </View>
        <Text style={styles.transitionTitle}>Now let's focus on today.</Text>
        <Text style={styles.transitionSub}>
          Your habits are waiting for your intention.
        </Text>
      </View>

      <View style={[styles.footer, { borderTopColor: 'rgba(255,255,255,0.12)' }]}>
        <MDPrimaryCTA label="Go to pledge" onPress={onGo} light />
      </View>
    </View>
  );
}

// Main flow controller
export default function MissedDayScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { missedDayInfo, useFreeze, resetStreak, clearMissedDay } = useStreakStore();

  const [stage, setStage] = useState<'acknowledge' | 'freeze-used' | 'reset' | 'transition'>('acknowledge');

  // If no missed day info, go back
  if (!missedDayInfo) {
    return null;
  }

  const handleUseFreeze = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await useFreeze(yesterday.toISOString().split('T')[0]);
    setStage('freeze-used');
  };

  const handleLetReset = async () => {
    await resetStreak();
    setStage('reset');
  };

  const handleContinue = () => {
    setStage('transition');
  };

  const handleGoPledge = () => {
    clearMissedDay();
    router.replace('/pledge');
  };

  if (stage === 'acknowledge') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <MissedAcknowledge
          missedHabits={missedDayInfo.missedHabits}
          streakValue={missedDayInfo.streakValue}
          freezesAvailable={missedDayInfo.freezesAvailable}
          onUseFreeze={handleUseFreeze}
          onLetReset={handleLetReset}
        />
      </View>
    );
  }

  if (stage === 'freeze-used') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <MissedFreezeUsed
          streakValue={missedDayInfo.streakValue}
          freezesRemaining={missedDayInfo.freezesAvailable - 1}
          onContinue={handleContinue}
        />
      </View>
    );
  }

  if (stage === 'reset') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <MissedReset onContinue={handleContinue} />
      </View>
    );
  }

  return <MissedTransition onGo={handleGoPledge} />;
}