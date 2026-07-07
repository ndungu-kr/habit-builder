import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Easing, AccessibilityInfo, Alert } from 'react-native';
import { useEffect, useRef } from 'react';
import FadeInView from '@/components/FadeInView';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useLocalSearchParams, router } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme/typography';
import { layout, spacing } from '@/theme/spacing';
import { IconFlame, IconSnowflake } from '@/components/Icons';
import Svg, { Path, Rect, Circle, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';

// ── Badge Components ──

function StreakBadge({ days, hue = 'bronze' }: { days: number; hue?: 'bronze' | 'gold' | 'silver' }) {
  const palettes = {
    bronze: ['#E8B889', '#C48155', '#915B3C'],
    gold: ['#F4D89C', '#D4A053', '#9A7028'],
    silver: ['#E8E4DC', '#B8B0A0', '#7F786A'],
  };
  const p = palettes[hue];

  return (
    <View style={badgeStyles.container}>
      {/* Outer ring */}
      <View style={[badgeStyles.outerRing, { backgroundColor: p[1] }]}>
        {/* Inner disc */}
        <View style={[badgeStyles.innerDisc, { backgroundColor: p[0] }]}>
          <IconFlame size={28} color="#fff" />
          <Text style={badgeStyles.badgeNumber}>{days}</Text>
          <Text style={badgeStyles.badgeLabel}>Day Streak</Text>
        </View>
      </View>
    </View>
  );
}

function HabitBadge({ count, color }: { count: number; color: string }) {
  return (
    <View style={badgeStyles.container}>
      <View style={[badgeStyles.outerRing, { backgroundColor: color }]}>
        <View style={[badgeStyles.innerDisc, { backgroundColor: color }]}>
          <Text style={[badgeStyles.badgeNumber, { fontSize: 52 }]}>{count}</Text>
          <Text style={badgeStyles.badgeLabel}>Sessions</Text>
        </View>
      </View>
    </View>
  );
}

// ── Icon Components ──

function SaveIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShareIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3v12m0-12l-4 4m4-4l4 4M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowRightIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 5l7 7-7 7"
        stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18"
        stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// ── Animated Badge ──

function BadgeBounceIn({ children }: { children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(-0.08)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (enabled) {
        scale.setValue(1);
        opacity.setValue(1);
        rotate.setValue(0);
        return;
      }

      Animated.sequence([
        Animated.delay(450),
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 8,
            stiffness: 120,
            mass: 0.7,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
            damping: 10,
            stiffness: 80,
          }),
        ]),
      ]).start();
    });
  }, []);

  const spin = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-30deg', '30deg'],
  });

  return (
    <Animated.View style={{ opacity, transform: [{ scale }, { rotate: spin }] }}>
      {children}
    </Animated.View>
  );
}

// ── Sub-components ──

function StatPillCard({ colors, label, value }: { colors: any; label: string; value: string }) {
  return (
    <View style={[subStyles.statCard, { backgroundColor: colors.surface }]}>
      <Text style={[subStyles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[subStyles.statValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

function FreezeEarnedNote({ colors, freezeCount }: { colors: any; freezeCount: number }) {
  return (
    <View style={[subStyles.freezeNote, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '33' }]}>
      <View style={[subStyles.freezeIcon, { backgroundColor: colors.bg, borderColor: colors.accent }]}>
        <IconSnowflake size={16} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[subStyles.freezeTitle, { color: colors.textPrimary }]}>
          You also earned a streak freeze.
        </Text>
        <Text style={[subStyles.freezeSub, { color: colors.textSecondary }]}>
          {freezeCount} / 3 banked
        </Text>
      </View>
    </View>
  );
}

// ── Main Screen ──

export default function MilestoneScreen() {
  const { colors } = useTheme();
  const viewShotRef = useRef<any>(null);

  const handleSave = async () => {
    try {
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Save milestone' });
    } catch {
      Alert.alert('Error', 'Could not save milestone.');
    }
  };

  const handleShare = async () => {
    try {
      const uri = await captureRef(viewShotRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Error', 'Could not share milestone.');
    }
  };

  const params = useLocalSearchParams<{
    type: 'streak' | 'habit';
    count: string;
    habitName?: string;
    habitColor?: string;
    freezeEarned?: string;
    freezeCount?: string;
  }>();

  const count = parseInt(params.count || '7', 10);
  const isStreak = params.type === 'streak';
  const habitName = params.habitName || 'Habit';
  const habitColor = params.habitColor || colors.accent;
  const freezeEarned = params.freezeEarned === 'true';
  const freezeCount = parseInt(params.freezeCount || '0', 10);

  // Pick hue based on streak count
  const getHue = (n: number): 'bronze' | 'gold' | 'silver' => {
    if (n >= 90) return 'gold';
    if (n >= 30) return 'gold';
    return 'bronze';
  };

  // Dynamic content based on milestone type and count
  const getContent = () => {
    if (isStreak) {
      if (count === 7) return {
        eyebrow: 'Unified streak',
        headline: 'One week of showing up.',
        message: 'Seven scheduled days in a row, all habits engaged with. This is becoming a rhythm.',
      };
      if (count === 14) return {
        eyebrow: 'Unified streak',
        headline: 'Two weeks strong.',
        message: 'Fourteen days of consistency. You\'re proving this isn\'t a fluke.',
      };
      if (count === 30) return {
        eyebrow: 'Unified streak',
        headline: 'A full month. You built this.',
        message: 'Thirty scheduled days, every habit engaged with. This is who you are now.',
      };
      if (count === 60) return {
        eyebrow: 'Unified streak',
        headline: 'Sixty days. Unbreakable.',
        message: 'Two months of dedication. This habit is no longer a goal - it\'s a part of you.',
      };
      if (count === 90) return {
        eyebrow: 'Unified streak',
        headline: 'Ninety days of transformation.',
        message: 'A full quarter of showing up. The person who started this would be proud.',
      };
      if (count === 180) return {
        eyebrow: 'Unified streak',
        headline: 'Half a year.',
        message: 'One hundred and eighty days. What once took effort now feels like who you are.',
      };
      return {
        eyebrow: 'Unified streak',
        headline: `${count} days. Legendary.`,
        message: 'Every single day, you chose this. And it chose you back.',
      };
    }
    // Habit milestone
    return {
      eyebrow: habitName,
      headline: `${count} sessions of ${habitName.toLowerCase()}.`,
      message: `Look how far you've come. Each one was a choice - ${count} times you chose this.`,
    };
  };

  const content = getContent();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Warm gradient overlay */}
      <View style={[styles.gradient, {
        backgroundColor: colors.bg === '#1C1A18' ? '#221F1C' : '#FBF6EE',
      }]} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View ref={viewShotRef} collapsable={false} style={{ backgroundColor: colors.bg === '#1C1A18' ? '#221F1C' : '#FBF6EE' }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 44 }} />
          <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>Milestone</Text>
          <Pressable
            style={[styles.closeBtn, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            accessibilityLabel="Close milestone"
            accessibilityRole="button"
          >
            <CloseIcon color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Badge */}
        <View style={styles.badgeWrap}>
          <BadgeBounceIn>
            {isStreak ? (
              <StreakBadge days={count} hue={getHue(count)} />
            ) : (
              <HabitBadge count={count} color={habitColor} />
            )}
          </BadgeBounceIn>
        </View>

        {/* Text content */}
        <View style={styles.textBlock}>
          <FadeInView delay={250}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>{content.eyebrow}</Text>
          </FadeInView>
          <FadeInView delay={400}>
            <Text style={[styles.headline, { color: colors.textPrimary }]}>{content.headline}</Text>
          </FadeInView>
          <FadeInView delay={550}>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{content.message}</Text>
          </FadeInView>
        </View>

        {/* Freeze earned note (streak milestones at multiples of 7) */}
        {freezeEarned && (
          <FadeInView delay={700}>
            <View style={styles.noteWrap}>
              <FreezeEarnedNote colors={colors} freezeCount={freezeCount} />
            </View>
          </FadeInView>
        )}

        <View style={{ flex: 1, minHeight: 40 }} />
        </View>
      </ScrollView>

      {/* Action row */}
      <FadeInView delay={700}>
        <View style={styles.actionRow}>
          <AnimatedPressable scaleValue={0.93} style={[styles.actionBtn, { backgroundColor: colors.surface }]} onPress={handleSave}>
            <SaveIcon color={colors.textPrimary} />
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Save</Text>
          </AnimatedPressable>
          <AnimatedPressable scaleValue={0.93} style={[styles.actionBtn, { backgroundColor: colors.surface }]} onPress={handleShare}>
            <ShareIcon color={colors.textPrimary} />
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Share</Text>
          </AnimatedPressable>
          <AnimatedPressable scaleValue={0.93} style={[styles.actionBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.back()}>
            <ArrowRightIcon color="#fff" />
            <Text style={[styles.actionLabel, { color: '#fff' }]}>Keep going</Text>
          </AnimatedPressable>
        </View>
      </FadeInView>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    width: 168,
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    padding: 5,
    shadowColor: '#3C2814',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 12,
  },
  innerDisc: {
    flex: 1,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 52,
    color: '#fff',
    lineHeight: 52,
    letterSpacing: -2,
    marginTop: 2,
  },
  badgeLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});

const subStyles = StyleSheet.create({
  statCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  freezeNote: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  freezeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezeTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13.5,
    letterSpacing: -0.05,
  },
  freezeSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    marginTop: 1,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  headerLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 22,
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  eyebrow: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 30,
    marginTop: 8,
    letterSpacing: -0.8,
    lineHeight: 33,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15.5,
    marginTop: 10,
    lineHeight: 23,
    textAlign: 'center',
  },
  noteWrap: {
    paddingHorizontal: 24,
    marginTop: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12.5,
    letterSpacing: -0.05,
  },
});