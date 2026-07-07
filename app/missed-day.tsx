import { useState, useEffect } from 'react';
import FadeInView from '@/components/FadeInView';
import AnimatedPressable from '@/components/AnimatedPressable';
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
import HelpTooltip from '@/components/HelpTooltip';
import Toast from 'react-native-toast-message';

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
    <AnimatedPressable
      scaleValue={0.96}
      style={[
        styles.primaryCta,
        {
          backgroundColor: light ? '#fff' : dim ? colors.surfaceAlt : colors.accent,
          shadowOpacity: dim ? 0 : 0.3,
        },
      ]}
      onPress={onPress}
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
    </AnimatedPressable>
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
        <FadeInView delay={0}>
          <Text style={[styles.eyebrow, { color: colors.missed }]}>
            Yesterday - {dateStr}
          </Text>
        </FadeInView>
        <FadeInView delay={150}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Yesterday didn't go as planned.
          </Text>
        </FadeInView>
        <FadeInView delay={300}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Everyone misses days. What matters is that you're here now.
          </Text>
        </FadeInView>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.decisionTitle, { color: colors.textPrimary, flex: 1 }]}>
                    You have {freezesAvailable} streak freeze{freezesAvailable !== 1 ? 's' : ''}
                  </Text>
                  <HelpTooltip
                    mode="sheet"
                    title="Streak freeze"
                    body="A grace mechanic. You earn one every 7 days you show up, and you can bank up to 3."
                    examples={[
                      "A freeze holds your streak at its current number - it doesn't add to it, because you didn't do the work that day.",
                      "Use a freeze when life gets in the way. Decline it if you want a clean reset.",
                      "The freeze decision happens the next morning, not the night you miss.",
                    ]}
                    size={18}
                  />
                </View>
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
        <FadeInView delay={0} slideDistance={0}>
        <View style={[styles.medallionOuter, { backgroundColor: colors.accentSoft }]}>
          <View style={[styles.medallionInner, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
            <IconSnowflake size={38} color={colors.accent} />
          </View>
        </View>
        </FadeInView>

        <FadeInView delay={200}>
        <Text style={[styles.bigTitle, { color: colors.textPrimary }]}>
          Your streak holds at {streakValue}.
        </Text>
        <Text style={[styles.bigSub, { color: colors.textSecondary }]}>
          The freeze holds your streak in place because you didn't do the work yesterday. Today, let's pick back up.
        </Text>
        </FadeInView>

        {/* Balance card */}
        <FadeInView delay={400}>
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
        </FadeInView>
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
        <FadeInView delay={0} slideDistance={0}>
          <View style={[styles.sunriseCircle, { backgroundColor: colors.accent }]}>
            <SunriseIcon />
          </View>
        </FadeInView>

        <FadeInView delay={200}>
        <Text style={[styles.bigTitle, { color: colors.textPrimary }]}>
          Today is Day 1 of something new.
        </Text>
        <Text style={[styles.bigSub, { color: colors.textSecondary }]}>
          Your streak resets, but what you've built doesn't go away.
        </Text>
        </FadeInView>

        {/* Lifetime stats card */}
        <FadeInView delay={400}>
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
        </FadeInView>
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
    const error = await useFreeze(yesterday.toISOString().split('T')[0]);
    if (error) {
      Toast.show({ type: 'error', text1: 'Couldn\'t use freeze', text2: error });
      return;
    }
    setStage('freeze-used');
  };

  const handleLetReset = async () => {
    const error = await resetStreak();
    if (error) {
      Toast.show({ type: 'error', text1: 'Couldn\'t reset streak', text2: error });
      return;
    }
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

const styles = StyleSheet.create({
  // Step header
  stepHeader: {
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: 20,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 999,
  },

  // Primary CTA
  primaryCta: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#C4835A',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 6,
  },
  primaryCtaLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    letterSpacing: -0.1,
  },
  primaryCtaSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    marginTop: 2,
  },

  // Habit chip
  habitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 12,
    paddingLeft: 0,
    overflow: 'hidden',
  },
  chipStrip: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 999,
  },
  chipName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    letterSpacing: -0.1,
  },
  chipKind: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  chipIcon: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },

  // Acknowledge
  eyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 32,
    marginTop: 6,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    marginTop: 10,
    lineHeight: 22.5,
  },
  trackedCard: {
    borderRadius: 16,
    padding: 16,
  },
  trackedLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // Decision card
  decisionCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  decisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  decisionIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    letterSpacing: -0.05,
  },
  decisionSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12.5,
    marginTop: 2,
  },
  decisionBody: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14.5,
    marginTop: 14,
    lineHeight: 21.75,
  },

  // Footer
  footerActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
  },

  // Center content (freeze-used, reset, transition)
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Freeze used
  medallionOuter: {
    width: 110,
    height: 110,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  medallionInner: {
    width: 76,
    height: 76,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  bigTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 33,
    textAlign: 'center',
  },
  bigSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    marginTop: 12,
    lineHeight: 24,
    textAlign: 'center',
  },
  balanceCard: {
    marginTop: 28,
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 14,
    borderRightWidth: 1,
  },
  balanceStreak: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  balanceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceFreeze: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
  },

  // Reset
  sunriseCircle: {
    width: 110,
    height: 110,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  lifetimeCard: {
    marginTop: 26,
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 320,
  },
  lifetimeLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  lifetimeGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  lifetimeStat: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  lifetimeCaption: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11.5,
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // Transition
  transitionBg: {
    flex: 1,
    overflow: 'hidden',
  },
  ringOuter: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ translateX: -180 }, { translateY: -180 }],
  },
  ringInner: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ translateX: -120 }, { translateY: -120 }],
  },
  arrowCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  transitionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 30,
    color: '#fff',
    letterSpacing: -0.6,
    lineHeight: 35,
    textAlign: 'center',
  },
  transitionSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 12,
    lineHeight: 24,
    textAlign: 'center',
  },
});