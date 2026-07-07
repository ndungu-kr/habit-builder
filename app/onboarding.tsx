import { useState, useEffect } from 'react';
import FadeInView from '@/components/FadeInView';
import AnimatedPressable from '@/components/AnimatedPressable';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';
import { useProfileStore } from '@/stores/profileStore';
import {
  requestNotificationPermissions,
  scheduleAllNotifications,
} from '@/utils/notifications';
import { useHabitStore } from '@/stores/habitStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/stores/authStore';

// ── Progress dots ──

function OnbProgress({ current, total = 5 }: { current: number; total?: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            {
              width: i + 1 === current ? 22 : 6,
              backgroundColor: i + 1 <= current ? colors.accent : colors.surfaceAlt,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ── CTA buttons ──

function OnbCTA({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  const { colors } = useTheme();

  if (secondary) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.secondaryCta}>
        <Text
          style={[styles.secondaryCtaText, { color: colors.textSecondary }]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <AnimatedPressable
      scaleValue={0.96}
      onPress={onPress}
      style={[styles.primaryCta, { backgroundColor: colors.accent }]}
    >
      <Text style={styles.primaryCtaText}>{label}</Text>
    </AnimatedPressable>
  );
}

function OnbFooter({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      {children}
    </View>
  );
}

// ── Icons ──

function SunriseLoopIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={14} r={4} fill={color} />
      <G stroke={color} strokeWidth={1.8} strokeLinecap="round">
        <Path d="M12 4v2" />
        <Path d="M4 14H2" />
        <Path d="M22 14h-2" />
        <Path d="M6.5 8.5L5 7" />
        <Path d="M17.5 8.5L19 7" />
      </G>
      <Path d="M3 20h18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function CheckCircleIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path
        d="M8 12.5l3 3 5-6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MoonLoopIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
        fill={color}
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={14} viewBox="0 0 20 14" fill="none">
      <Path
        d="M2 7h14M11 2l5 5-5 5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BellOnbIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M10 21h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

// ── Step 1: Welcome ──

function StepWelcome({ onNext }: { onNext: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <OnbProgress current={1} />

      <View style={styles.welcomeHero}>
        {/* Layered accent circles - sunrise feel */}
        <View style={[styles.haloOuter, { backgroundColor: colors.accent + '30' }]} />
        <View style={[styles.haloMiddle, { backgroundColor: colors.accent + '55' }]} />
        <View style={[styles.haloInner, { backgroundColor: colors.accent }]} />

        <View style={styles.welcomeTextBlock}>
          <FadeInView delay={0}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>Habit Builder</Text>
          </FadeInView>
          <FadeInView delay={150}>
            <Text style={[styles.welcomeHeadline, { color: colors.textPrimary }]}>
              Build something meaningful.
            </Text>
          </FadeInView>
          <FadeInView delay={300}>
            <Text style={[styles.welcomeBody, { color: colors.textSecondary }]}>
              The same tools that help people overcome their hardest challenges, applied to the
              habits you want to build.
            </Text>
          </FadeInView>
          <FadeInView delay={450}>
          <View style={styles.featureDots}>
            <Text style={[styles.featureDotText, { color: colors.textTertiary }]}>
              Daily pledges
            </Text>
            <View style={[styles.dotSep, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.featureDotText, { color: colors.textTertiary }]}>
              Honest reflection
            </Text>
            <View style={[styles.dotSep, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.featureDotText, { color: colors.textTertiary }]}>
              Real progress
            </Text>
          </View>
          </FadeInView>
        </View>
      </View>

      <OnbFooter>
        <OnbCTA label="Get started" onPress={onNext} />
      </OnbFooter>
    </View>
  );
}

// ── Loop node for the diagram ──

function LoopNode({
  label,
  sub,
  icon,
  accent = false,
}: {
  label: string;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.loopNode}>
      <View
        style={[
          styles.loopIcon,
          {
            backgroundColor: colors.surface,
            borderColor: accent ? colors.accent : colors.border,
            ...(accent && {
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 18,
              elevation: 6,
            }),
          },
        ]}
      >
        {icon}
      </View>
      <Text style={[styles.loopLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.loopSub, { color: colors.textSecondary }]}>{sub}</Text>
    </View>
  );
}

// ── Step 2: Identity ──

function StepIdentity({ onCreateHabit }: { onCreateHabit: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <OnbProgress current={2} />

      <View style={{ paddingHorizontal: 32, paddingTop: 36 }}>
        <FadeInView delay={0}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>The shift</Text>
        </FadeInView>
        <FadeInView delay={150}>
          <Text style={[styles.stepHeadline, { color: colors.textPrimary }]}>
            Who do you want to become?
          </Text>
        </FadeInView>
        <FadeInView delay={300}>
          <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
            Most apps track what you do. This one helps you become who you want to be - by
            repeating a small daily loop.
          </Text>
        </FadeInView>
      </View>

      {/* Loop diagram */}
      <FadeInView delay={450}>
      <View style={[styles.loopCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loopCardLabel, { color: colors.textTertiary }]}>
          Every scheduled day
        </Text>
        <View style={styles.loopRow}>
          <LoopNode
            label="Pledge"
            sub="Morning"
            accent
            icon={<SunriseLoopIcon color={colors.accent} />}
          />
          <ArrowIcon color={colors.textTertiary} />
          <LoopNode
            label="Do"
            sub="Throughout the day"
            icon={<CheckCircleIcon color={colors.textSecondary} />}
          />
          <ArrowIcon color={colors.textTertiary} />
          <LoopNode
            label="Reflect"
            sub="Evening"
            icon={<MoonLoopIcon color={colors.textSecondary} />}
          />
        </View>
        <View style={[styles.loopAffirm, { backgroundColor: colors.bg }]}>
          <Text style={[styles.loopAffirmText, { color: colors.textPrimary }]}>
            You are someone who{' '}
            <Text style={{ color: colors.accent, fontFamily: 'Nunito_800ExtraBold' }}>
              shows up
            </Text>
            . Today proved it.
          </Text>
        </View>
      </View>
      </FadeInView>

      <View style={{ flex: 1 }} />

      <OnbFooter>
        <OnbCTA label="Create my first habit" onPress={onCreateHabit} />
      </OnbFooter>
    </View>
  );
}

// ── Rhythm tile ──

function RhythmTile({
  eyebrowText,
  label,
  time,
  icon,
  last = false,
  onPress,
}: {
  eyebrowText: string;
  label: string;
  time: string;
  icon: React.ReactNode;
  last?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.rhythmTile,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.rhythmIcon, { backgroundColor: colors.accentSoft }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rhythmEyebrow, { color: colors.accent }]}>{eyebrowText}</Text>
        <Text style={[styles.rhythmLabel, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      <View style={[styles.rhythmTime, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.rhythmTimeText, { color: colors.textPrimary }]}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Helper: format "HH:MM" to display time
function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
}

function timeToDate(timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 8, m || 0, 0, 0);
  return d;
}

// ── Step 3: Set Your Rhythm ──

function StepRhythm({ onFinish }: { onFinish: () => void }) {
  const { colors, isDark } = useTheme();
  const { profile, updateProfile } = useProfileStore();
  const { habits } = useHabitStore();

  const [morningTime, setMorningTime] = useState(profile?.morning_reminder_time ?? '08:00');
  const [eveningTime, setEveningTime] = useState(profile?.evening_reminder_time ?? '21:00');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [editingTime, setEditingTime] = useState<'morning' | 'evening' | null>(null);
  const [pendingTime, setPendingTime] = useState<Date | null>(null);

  const handleTimeScroll = (_event: any, selectedDate?: Date) => {
    if (selectedDate) setPendingTime(selectedDate);
  };

  const handleTimeDone = () => {
    if (!editingTime || !pendingTime) {
      setEditingTime(null);
      setPendingTime(null);
      return;
    }
    const h = pendingTime.getHours();
    const m = pendingTime.getMinutes();
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    if (editingTime === 'morning') setMorningTime(timeStr);
    else setEveningTime(timeStr);

    setEditingTime(null);
    setPendingTime(null);
  };

  const handleFinish = async () => {
    // Save times to profile
    await updateProfile({
      morning_reminder_time: morningTime,
      evening_reminder_time: eveningTime,
    });

    // Request permission and schedule if toggled on
    if (notificationsOn) {
      const granted = await requestNotificationPermissions();
      if (granted && profile) {
        const updated = {
          ...profile,
          morning_reminder_time: morningTime,
          evening_reminder_time: eveningTime,
        };
        scheduleAllNotifications(updated, habits);
      }
    }

    onFinish();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 50 }} />
      <OnbProgress current={4} />

      <View style={{ paddingHorizontal: 32, paddingTop: 36 }}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>Step 4</Text>
        <Text style={[styles.stepHeadline, { color: colors.textPrimary }]}>
          When should we check in?
        </Text>
        <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
          Two gentle moments a day. We'll only ping you on scheduled days.
        </Text>
      </View>

      {/* Time tiles */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <View style={[styles.tilesCard, { backgroundColor: colors.surface }]}>
          <RhythmTile
            eyebrowText="Morning"
            label="When do you want to set your intention?"
            time={formatTime(morningTime)}
            icon={<SunriseLoopIcon color={colors.accent} />}
            onPress={() => {
              setPendingTime(timeToDate(morningTime));
              setEditingTime('morning');
            }}
          />
          <RhythmTile
            eyebrowText="Evening"
            label="When do you want to reflect on your day?"
            time={formatTime(eveningTime)}
            icon={<MoonLoopIcon color={colors.accent} />}
            last
            onPress={() => {
              setPendingTime(timeToDate(eveningTime));
              setEditingTime('evening');
            }}
          />
        </View>
      </View>

      {/* Notification toggle */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={[styles.notifRow, { backgroundColor: colors.surface }]}>
          <View style={[styles.notifIcon, { backgroundColor: colors.surfaceAlt }]}>
            <BellOnbIcon color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>
              Send me reminders
            </Text>
            <Text style={[styles.notifSub, { color: colors.textSecondary }]}>
              Only on scheduled days. Never on rest days.
            </Text>
          </View>
          <Switch
            value={notificationsOn}
            onValueChange={setNotificationsOn}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
            ios_backgroundColor={colors.border}
          />
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Text style={[styles.reassurance, { color: colors.textTertiary }]}>
        You can change these anytime in Settings.
      </Text>

      <OnbFooter>
        <OnbCTA label="I'm ready" onPress={handleFinish} />
      </OnbFooter>

      {/* Time picker modal */}
      {editingTime && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            activeOpacity={1}
            onPress={() => setEditingTime(null)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.pickerSheet, { backgroundColor: colors.surface }]}
            >
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>
                  {editingTime === 'morning' ? 'Morning pledge time' : 'Evening check-in time'}
                </Text>
                <TouchableOpacity onPress={handleTimeDone}>
                  <Text style={[styles.pickerDone, { color: colors.accent }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pendingTime ?? new Date()}
                mode="time"
                display="spinner"
                onChange={handleTimeScroll}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Main onboarding controller ──

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { session } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  const [step, setStep] = useState<'welcome' | 'identity' | 'rhythm'>('welcome');
  const [ready, setReady] = useState(false);

  // On mount: check if returning from create, or if existing user
  useEffect(() => {
    const init = async () => {
      // Check if mid-onboarding (returning from habit creation)
      const savedStep = await SecureStore.getItemAsync(`onboarding_step_${session?.user.id}`);
      if (savedStep === 'rhythm') {
        setStep('rhythm');
        await SecureStore.deleteItemAsync(`onboarding_step_${session?.user.id}`);
        setReady(true);
        return;
      }

      // Check DB for existing user who already has habits
      await useHabitStore.getState().fetchHabits();
      const existing = useHabitStore.getState().habits;
      if (existing.length > 0) {
        await SecureStore.setItemAsync(`onboarding_done_${session?.user.id}`, 'true');
        router.replace('/(tabs)');
        return;
      }

      setReady(true);
    };
    init();
  }, []);

  const handleFinish = async () => {
    // Mark onboarding complete locally
    await SecureStore.setItemAsync(`onboarding_done_${session?.user.id}`, 'true');
    // Make sure profile is fresh for the home screen
    await fetchProfile();
    router.replace('/(tabs)');
  };

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {step === 'welcome' && <StepWelcome onNext={() => setStep('identity')} />}
      {step === 'identity' && (
        <StepIdentity onCreateHabit={async () => {
          setStep('rhythm');
          await SecureStore.setItemAsync(`onboarding_step_${session?.user.id}`, 'rhythm');
          router.push('/create');
        }} />
      )}
      {step === 'rhythm' && <StepRhythm onFinish={handleFinish} />}
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 14,
    paddingHorizontal: 24,
  },
  progressDot: {
    height: 6,
    borderRadius: 999,
  },

  // CTAs
  primaryCta: {
    borderRadius: 999,
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C4835A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryCtaText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.1,
  },
  secondaryCta: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  secondaryCtaText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    letterSpacing: -0.1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
  },

  // Shared text styles
  eyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  stepHeadline: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    marginTop: 10,
    letterSpacing: -0.8,
    lineHeight: 35,
  },
  stepBody: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    marginTop: 14,
    lineHeight: 23,
  },

  // Welcome
  welcomeHero: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  haloOuter: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 999,
  },
  haloMiddle: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 999,
  },
  haloInner: {
    position: 'absolute',
    top: '24%',
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 999,
  },
  welcomeTextBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    paddingHorizontal: 32,
  },
  welcomeHeadline: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 38,
    marginTop: 12,
    letterSpacing: -1,
    lineHeight: 40,
  },
  welcomeBody: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    marginTop: 16,
    lineHeight: 25,
  },
  featureDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 22,
  },
  featureDotText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  dotSep: {
    width: 4,
    height: 4,
    borderRadius: 999,
  },

  // Identity / Loop
  loopCard: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 20,
    padding: 24,
    paddingHorizontal: 16,
  },
  loopCardLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 14,
  },
  loopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  loopNode: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  loopIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13.5,
    letterSpacing: -0.05,
  },
  loopSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 11.5,
    letterSpacing: 0.2,
  },
  loopAffirm: {
    marginTop: 20,
    marginHorizontal: 8,
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  loopAffirmText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: -0.05,
  },

  // Rhythm
  tilesCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  rhythmTile: {
    padding: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rhythmIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rhythmEyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  rhythmLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14.5,
    letterSpacing: -0.05,
    lineHeight: 19,
    marginTop: 3,
  },
  rhythmTime: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  rhythmTimeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    letterSpacing: -0.3,
  },
  notifRow: {
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  notifIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14.5,
    letterSpacing: -0.05,
  },
  notifSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 17,
  },
  reassurance: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12.5,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingBottom: 14,
    lineHeight: 17,
  },

  // Time picker
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pickerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
  },
  pickerDone: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
  },
});