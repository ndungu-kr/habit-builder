import { useEffect } from 'react';
import FadeInView from '@/components/FadeInView';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useStreakStore } from '@/stores/streakStore';
import { useJourneyStore } from '@/stores/journeyStore';
import { useProfileStore } from '@/stores/profileStore';
import { IconFlame, IconSnowflake } from '@/components/Icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

// ── Section Header ──

function SectionHeader({ label, action }: { label: string; action?: string }) {
  const { colors } = useTheme();
  return (
    <View style={sStyles.row}>
      <Text style={[sStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      {action && (
        <Text style={[sStyles.action, { color: colors.accent }]}>{action}</Text>
      )}
    </View>
  );
}

const sStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  action: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: -0.05,
  },
});

// ── Streak Overview Card ──

function StreakOverviewCard() {
  const { colors } = useTheme();
  const { streak } = useStreakStore();
  const currentStreak = streak?.current_streak ?? 0;
  const freezes = streak?.freezes_available ?? 0;

  return (
    <View style={[oStyles.card, { backgroundColor: colors.surface }]}>
      <View style={[oStyles.decorRing, { backgroundColor: colors.accentSoft }]} />
      <View style={oStyles.headerRow}>
        <IconFlame size={20} color={colors.accent} />
        <Text style={[oStyles.headerLabel, { color: colors.textSecondary }]}>
          Unified streak
        </Text>
      </View>
      <View style={oStyles.valueRow}>
        <Text style={[oStyles.bigNumber, { color: colors.accent }]}>
          {currentStreak}
        </Text>
        <Text style={[oStyles.unit, { color: colors.textSecondary }]}>days</Text>
      </View>
      <View style={[oStyles.freezePill, { backgroundColor: colors.bg }]}>
        <IconSnowflake size={12} color={colors.textSecondary} />
        <Text style={[oStyles.freezeText, { color: colors.textSecondary }]}>
          {freezes} / 3 freezes banked
        </Text>
      </View>
    </View>
  );
}

const oStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  decorRing: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 10,
  },
  bigNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 56,
  },
  unit: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    letterSpacing: -0.2,
    marginLeft: 4,
  },
  freezePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  freezeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.4,
  },
});

// ── Mini Overview Card ──

function MiniOverview({ label, value, sub }: { label: string; value: string; sub: string }) {
  const { colors } = useTheme();
  return (
    <View style={[mStyles.card, { backgroundColor: colors.surface }]}>
      <Text style={[mStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[mStyles.value, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[mStyles.sub, { color: colors.textSecondary }]}>{sub}</Text>
    </View>
  );
}

const mStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 20,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 30,
    marginTop: 10,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  sub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    marginTop: 8,
  },
});

// ── Heatmap ──

type CellKind = 'full' | 'partial' | 'none' | 'rest' | 'freeze';

function HeatmapCell({ kind, size = 18 }: { kind: CellKind; size?: number }) {
  const { colors } = useTheme();
  const r = 6;

  const cellStyles: Record<CellKind, { bg: string; border?: string; dashed?: boolean; showSnow?: boolean }> = {
    rest: { bg: 'transparent', border: colors.border, dashed: true },
    none: { bg: colors.surfaceAlt },
    partial: { bg: colors.accent + '55' },
    full: { bg: colors.accent },
    freeze: { bg: colors.surface, border: colors.accent, showSnow: true },
  };

  const s = cellStyles[kind];

  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: r,
      backgroundColor: s.bg,
      borderWidth: s.border ? 1.5 : 0,
      borderColor: s.border || 'transparent',
      borderStyle: s.dashed ? 'dashed' : 'solid',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {s.showSnow && <IconSnowflake size={10} color={colors.accent} />}
    </View>
  );
}

function HeatmapLegend() {
  const { colors } = useTheme();
  const items: { kind: CellKind; label: string }[] = [
    { kind: 'full', label: 'All habits' },
    { kind: 'partial', label: 'Partial day' },
    { kind: 'freeze', label: 'Freeze' },
    { kind: 'rest', label: 'Rest' },
    { kind: 'none', label: 'Missed' },
  ];

  return (
    <View style={hStyles.legendRow}>
      {items.map((item) => (
        <View key={item.kind} style={hStyles.legendItem}>
          <HeatmapCell kind={item.kind} size={12} />
          <Text style={[hStyles.legendText, { color: colors.textSecondary }]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ActivityHeatmap() {
  const { colors } = useTheme();
  const { heatmapData } = useJourneyStore();
  const weekStart = useProfileStore((s) => s.profile?.week_start_day ?? 'monday');
  // Shift labels to match whichever day starts the week
  const dayLabels = weekStart === 'sunday'
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={[hStyles.card, { backgroundColor: colors.surface }]}>
      <View style={hStyles.headerRow}>
        <View>
          <Text style={[hStyles.title, { color: colors.textPrimary }]}>Activity</Text>
          <Text style={[hStyles.subtitle, { color: colors.textSecondary }]}>
            Last 13 weeks
          </Text>
        </View>
        <View style={[hStyles.weekPill, { backgroundColor: colors.bg }]}>
          <Text style={[hStyles.weekPillText, { color: colors.textSecondary }]}>13W</Text>
        </View>
      </View>
      <View style={hStyles.gridContainer}>
        {/* Day labels */}
        <View style={hStyles.dayLabels}>
          {dayLabels.map((d, i) => (
            <Text key={i} style={[hStyles.dayLabel, { color: colors.textTertiary }]}>
              {d}
            </Text>
          ))}
        </View>
        {/* Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hStyles.gridScroll}>
          <View style={hStyles.grid}>
            {heatmapData.map((week, wi) => (
              <View key={wi} style={hStyles.weekCol}>
                {week.map((cell, di) => (
                  <HeatmapCell key={di} kind={cell} size={18} />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <HeatmapLegend />
    </View>
  );
}

const hStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12.5,
    marginTop: 2,
  },
  weekPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  weekPillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: -0.05,
  },
  gridContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  dayLabels: {
    gap: 4,
    paddingTop: 2,
  },
  dayLabel: {
    width: 14,
    height: 18,
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    lineHeight: 18,
  },
  gridScroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  weekCol: {
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    columnGap: 14,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.2,
  },
});

// ── Sparkline ──

function Sparkline({ color, data }: { color: string; data: number[] }) {
  if (data.length < 2) return null;
  const w = 80;
  const h = 28;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - v * h]);
  const linePath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');
  const areaPath = linePath + ` L${w},${h} L0,${h} Z`;
  const gradId = `spark-${color.replace('#', '')}`;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradId})`} />
      <Path d={linePath} fill="none" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Habit Progress Card ──

function HabitProgressCard({
  name, accent, timesShownUp, rate, sparkline,
}: {
  name: string; accent: string; timesShownUp: number; rate: number; sparkline: number[];
}) {
  const { colors } = useTheme();

  return (
    <View style={[pStyles.card, { backgroundColor: colors.surface }]}>
      <View style={[pStyles.strip, { backgroundColor: accent }]} />
      <View style={pStyles.content}>
        <Text style={[pStyles.name, { color: colors.textPrimary }]}>{name}</Text>
        <View style={pStyles.statsRow}>
          <Text style={[pStyles.stat, { color: colors.textSecondary }]}>
            <Text style={[pStyles.statBold, { color: colors.textPrimary }]}>
              {timesShownUp}
            </Text>
            {' '}shown up
          </Text>
          <View style={[pStyles.dot, { backgroundColor: colors.textTertiary }]} />
          <Text style={[pStyles.stat, { color: colors.textSecondary }]}>
            <Text style={[pStyles.statBold, { color: colors.textPrimary }]}>
              {rate}%
            </Text>
          </Text>
        </View>
      </View>
      <Sparkline color={accent} data={sparkline} />
    </View>
  );
}

const pStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    paddingLeft: 20,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  strip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    letterSpacing: -0.1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  stat: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },
  statBold: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
  },
});

// ── Milestone Badge ──

function MilestoneBadge({
  count, label, type, color, hue,
}: {
  count: number; label: string; type: 'streak' | 'habit'; color: string; hue?: 'bronze' | 'gold';
}) {
  const { colors } = useTheme();
  const palettes = {
    bronze: ['#E8B889', '#C48155'],
    gold: ['#F4D89C', '#D4A053'],
  };
  const cs = type === 'streak' ? palettes[hue || 'bronze'] : [color, color];

  return (
    <View style={[bStyles.card, { backgroundColor: colors.surface }]}>
      <View style={[bStyles.circle, { backgroundColor: cs[0] }]}>
        {type === 'streak' && <IconFlame size={14} color="#fff" />}
        <Text style={[bStyles.count, { fontSize: type === 'streak' ? 20 : 24 }]}>
          {count}
        </Text>
      </View>
      <Text style={[bStyles.label, { color: colors.textPrimary }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
    width: (Dimensions.get('window').width - 48 - 20) / 3,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3C2814',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  count: {
    fontFamily: 'Nunito_800ExtraBold',
    color: '#fff',
    letterSpacing: -0.5,
    marginLeft: 2,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: -0.05,
    lineHeight: 14.4,
    textAlign: 'center',
  },
});

// ── Main Screen ──

export default function JourneyScreen() {
  const { colors } = useTheme();
  const { fetchStreak } = useStreakStore();
  const {
    lifetimeDays, weeklyRate, habitProgress, milestones, isLoading, fetchJourneyData,
  } = useJourneyStore();

  useEffect(() => {
    fetchStreak();
    fetchJourneyData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Nav header */}
        <View style={styles.navBar}>
          <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Journey</Text>
          <Text style={[styles.navSub, { color: colors.textSecondary }]}>
            Your progress over time
          </Text>
        </View>

        {/* Overview cards */}
        <View style={styles.overviewSection}>
          <FadeInView delay={0}>
            <StreakOverviewCard />
          </FadeInView>
          <FadeInView delay={100}>
          <View style={styles.miniRow}>
            <MiniOverview
              label="Lifetime"
              value={String(lifetimeDays)}
              sub="Days shown up"
            />
            <MiniOverview
              label="This week"
              value={`${weeklyRate}%`}
              sub="Completion rate"
            />
          </View>
          </FadeInView>
        </View>

        {/* Heatmap */}
        <FadeInView delay={200}>
          <View style={styles.heatmapSection}>
            <ActivityHeatmap />
          </View>
        </FadeInView>

        {/* Habits */}
        {habitProgress.length > 0 && (
          <FadeInView delay={300}>
          <View style={styles.habitsSection}>
            <SectionHeader label="Your habits" />
            <View style={styles.habitList}>
              {habitProgress.map((h) => (
                <HabitProgressCard
                  key={h.habitId}
                  name={h.name}
                  accent={h.color}
                  timesShownUp={h.timesShownUp}
                  rate={h.completionRate}
                  sparkline={h.sparkline}
                />
              ))}
            </View>
          </View>
          </FadeInView>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <FadeInView delay={400}>
          <View style={styles.milestonesSection}>
            <SectionHeader
              label={`Milestones \u00B7 ${milestones.length} earned`}
            />
            <View style={styles.milestoneGrid}>
              {milestones.map((m) => (
                <MilestoneBadge
                  key={m.id}
                  count={m.count}
                  label={m.label}
                  type={m.type}
                  color={m.color}
                  hue={m.hue}
                />
              ))}
            </View>
          </View>
          </FadeInView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  navBar: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
  },
  navTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    letterSpacing: -0.6,
    lineHeight: 35,
  },
  navSub: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    marginTop: 4,
  },
  overviewSection: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  miniRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  heatmapSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  habitsSection: {
    paddingTop: 28,
  },
  habitList: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 10,
  },
  milestonesSection: {
    paddingTop: 28,
  },
  milestoneGrid: {
    paddingHorizontal: 24,
    paddingTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});