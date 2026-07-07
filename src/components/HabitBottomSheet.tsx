import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  AccessibilityInfo,
  Dimensions,
  PanResponder,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';
import { IconCheck, IconChevronRight } from '@/components/Icons';
import { Habit, CompletionStatus } from '@/types';
import HelpTooltip from '@/components/HelpTooltip';

type SheetVariant = 'unpledged' | 'pledged' | 'partial' | 'completed' | 'note';

interface HabitBottomSheetProps {
  visible: boolean;
  habit: Habit;
  variant: SheetVariant;
  onClose: () => void;
  onMarkComplete: () => void;
  onMarkPartial: (value: number, note?: string) => void;
  onSkip: () => void;
  onUndo: () => void;
  onPledgeFirst: () => void;
  onViewDetails: () => void;
  onAddNote: (note: string) => void;
}

// Drag handle at top of sheet
function SheetHandle() {
  const { colors } = useTheme();
  return (
    <View style={styles.handleRow}>
      <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} />
    </View>
  );
}

// Habit name, goal, accent strip at top of sheet
function SheetHabitHeader({
  habit,
  statusBadge,
}: {
  habit: Habit;
  statusBadge?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <View style={[styles.headerStrip, { backgroundColor: habit.color || colors.accent }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerName, { color: colors.textPrimary }]}>
          {habit.name}
        </Text>
        <Text style={[styles.headerGoal, { color: colors.textSecondary }]}>
          {habit.goal_value} {habit.goal_unit} · 0 times shown up
        </Text>
      </View>
      {statusBadge}
    </View>
  );
}

// Small icons used inside option circles
function PartialIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path d="M12 3 a9 9 0 0 1 0 18 Z" fill={color} />
    </Svg>
  );
}

function NoteIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 5h10l4 4v10H5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M9 13h7M9 16h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function SkipIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M7 12h10" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function UndoIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 9h10a5 5 0 0 1 0 10h-3" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 4l-4 5 4 5" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DetailsIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M12 11v5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={8} r={1} fill={color} />
    </Svg>
  );
}

function PledgeStarIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l2.4 5.5 6 .6-4.5 4 1.4 5.9L12 16l-5.3 3 1.4-5.9-4.5-4 6-.6L12 3Z"
        fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round"
      />
    </Svg>
  );
}

// Big filled CTA button
function PrimaryAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.primaryAction, { backgroundColor: colors.accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
      <Text style={styles.primaryActionText}>{label}</Text>
    </TouchableOpacity>
  );
}

// Row option with icon circle, label, sublabel
function SheetOption({
  label,
  sublabel,
  icon,
  danger = false,
  accent = false,
  chevron = false,
  last = false,
  trailing,
  onPress,
}: {
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  danger?: boolean;
  accent?: boolean;
  chevron?: boolean;
  last?: boolean;
  trailing?: React.ReactNode;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const labelColor = danger ? colors.missed : accent ? colors.accent : colors.textPrimary;
  const circleBg = danger
    ? 'rgba(196, 131, 122, 0.12)'
    : accent
    ? colors.accentSoft
    : colors.surfaceAlt;

  return (
    <TouchableOpacity
      style={[styles.option, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.optionIcon, { backgroundColor: circleBg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionLabel, { color: labelColor }]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.optionSublabel, { color: colors.textSecondary }]}>
            {sublabel}
          </Text>
        )}
      </View>
      {trailing}
      {chevron && <IconChevronRight size={16} color={colors.textTertiary} />}
    </TouchableOpacity>
  );
}

// +/- stepper for partial value
function ValueStepper({
  value,
  unit,
  goalValue,
  onChange,
}: {
  value: number;
  unit: string;
  goalValue: number;
  onChange: (v: number) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.stepper, { backgroundColor: colors.surfaceAlt }]}>
      <TouchableOpacity
        style={[styles.stepperBtn, { backgroundColor: colors.bg }]}
        onPress={() => onChange(Math.max(0, value - 1))}
      >
        <Text style={[styles.stepperBtnText, { color: colors.textPrimary }]}>-</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={[styles.stepperValue, { color: colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>
          {unit} · of {goalValue} {unit} goal
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.stepperBtn, { backgroundColor: colors.bg }]}
        onPress={() => onChange(value + 1)}
      >
        <Text style={[styles.stepperBtnText, { color: colors.textPrimary }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// When user hasn't pledged yet today
function SheetUnpledged({
  habit,
  onPledgeFirst,
  onMarkComplete,
}: {
  habit: Habit;
  onPledgeFirst: () => void;
  onMarkComplete: () => void;
}) {
  const { colors } = useTheme();
  return (
    <>
      <SheetHabitHeader habit={habit} />
      <View style={styles.messageBox}>
        <Text style={[styles.messageTitle, { color: colors.textPrimary }]}>
          You haven't pledged yet today.
        </Text>
        <Text style={[styles.messageSub, { color: colors.textSecondary }]}>
          Setting your intention first helps you show up with purpose. Or jump straight to
          logging it - your call.
        </Text>
      </View>
      <PrimaryAction
        label="Pledge first"
        icon={<PledgeStarIcon color="#fff" />}
        onPress={onPledgeFirst}
      />
      <View style={{ marginTop: 8 }}>
        <SheetOption
          label="Just mark complete"
          sublabel="Skip the pledge, log it as done"
          icon={<IconCheck size={14} color={colors.success} strokeWidth={2.6} />}
          onPress={onMarkComplete}
          last
        />
      </View>
    </>
  );
}

// After pledging - main options
function SheetPledged({
  habit,
  onMarkComplete,
  onPartial,
  onSkip,
  onAddNote,
}: {
  habit: Habit;
  onMarkComplete: () => void;
  onPartial: () => void;
  onSkip: () => void;
  onAddNote: () => void;
}) {
  const { colors } = useTheme();
  return (
    <>
      <SheetHabitHeader
        habit={habit}
        statusBadge={
          <View style={[styles.pledgedBadge, { borderColor: colors.accent }]}>
            <Text style={[styles.pledgedBadgeText, { color: colors.accent }]}>Pledged</Text>
          </View>
        }
      />
      <PrimaryAction
        label="Mark as complete"
        icon={<IconCheck size={16} color="#fff" strokeWidth={2.6} />}
        onPress={onMarkComplete}
      />
      <View style={{ marginTop: 14, marginHorizontal: 4 }}>
        <SheetOption
          label="I did some, but not all"
          sublabel="Partial counts toward your streak"
          icon={<PartialIcon color={colors.partial} />}
          onPress={onPartial}
        />
        <SheetOption
          label="Add a note"
          sublabel="Capture a thought without changing status"
          icon={<NoteIcon color={colors.textSecondary} />}
          onPress={onAddNote}
        />
        <SheetOption
          label="Skip today"
          sublabel="An intentional choice - different from a miss"
          icon={<SkipIcon color={colors.missed} />}
          danger
          last
          onPress={onSkip}
          trailing={
            <HelpTooltip
              mode="popover"
              title="Skip vs miss"
              body="Both break the streak; skips are tracked separately as a conscious choice."
              size={18}
            />
          }
        />
      </View>
    </>
  );
}

// Partial input - stepper + note
function SheetPartial({
  habit,
  onSubmit,
  onCancel,
}: {
  habit: Habit;
  onSubmit: (value: number, note?: string) => void;
  onCancel: () => void;
}) {
  const { colors } = useTheme();
  const [value, setValue] = useState(Math.floor(habit.goal_value / 2));
  const [note, setNote] = useState('');

  return (
    <>
      <SheetHabitHeader habit={habit} />
      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.messageTitle, { color: colors.textPrimary, flex: 1 }]}>
            How much did you do?
          </Text>
          <HelpTooltip
            mode="popover"
            title="Partial completion"
            body="Keeps your streak going and adds to cumulative stats. Every bit counts."
          />
        </View>
        <Text style={[styles.partialHint, { color: colors.textSecondary }]}>
          Every bit of effort counts.
        </Text>
        <View style={{ marginTop: 14 }}>
          <ValueStepper
            value={value}
            unit={habit.goal_unit}
            goalValue={habit.goal_value}
            onChange={setValue}
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
          What did you manage?{' '}
          <Text style={{ color: colors.textTertiary, textTransform: 'none', letterSpacing: 0 }}>
            (optional)
          </Text>
        </Text>
        <TextInput
          style={[styles.noteInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
          placeholder="A short walk before bed counted - even if quick..."
          placeholderTextColor={colors.textTertiary}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={2}
        />
      </View>
      <PrimaryAction
        label="Log partial completion"
        icon={<PartialIcon color="#fff" />}
        onPress={() => onSubmit(value, note || undefined)}
      />
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
      </TouchableOpacity>
    </>
  );
}

// After completing - celebration + options
function SheetCompleted({
  habit,
  onUndo,
  onClose,
  onViewDetails,
  onAddNote,
}: {
  habit: Habit;
  onUndo: () => void;
  onClose: () => void;
  onViewDetails: () => void;
  onAddNote: () => void;
}) {
  const { colors } = useTheme();
  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const pulseScale = useRef(new Animated.Value(0.6)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (enabled) {
        checkScale.setValue(1);
        return;
      }
      // Checkmark bounces in
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 150,
        mass: 0.6,
        delay: 200,
      }).start();
      // Subtle pulse ring
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 1.5, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ).start();
    });
  }, []);

  return (
    <>
      <SheetHabitHeader
        habit={habit}
        statusBadge={
          <View style={[styles.doneBadge, { backgroundColor: colors.success }]}>
            <IconCheck size={12} color="#fff" strokeWidth={2.8} />
            <Text style={styles.doneBadgeText}>Done</Text>
          </View>
        }
      />
      <View style={styles.completedCenter}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[styles.completedCircle, { backgroundColor: colors.success, position: 'absolute', opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
          <Animated.View style={[styles.completedCircle, { backgroundColor: 'rgba(125, 166, 138, 0.16)', transform: [{ scale: checkScale }] }]}>
            <IconCheck size={28} color={colors.success} strokeWidth={2.8} />
          </Animated.View>
        </View>
        <Text style={[styles.completedTitle, { color: colors.textPrimary }]}>
          You showed up today.
        </Text>
        <Text style={[styles.completedSub, { color: colors.textSecondary }]}>
          Completed at {timeStr}
        </Text>
      </View>
      <View style={{ marginTop: 14, marginHorizontal: 4 }}>
        <SheetOption
          label="Add a note"
          sublabel="Capture how it went"
          icon={<NoteIcon color={colors.textSecondary} />}
          onPress={onAddNote}
        />
        <SheetOption
          label="View habit details"
          sublabel="Whys, history, milestones"
          icon={<DetailsIcon color={colors.textSecondary} />}
          chevron
          onPress={onViewDetails}
        />
        <SheetOption
          label="Undo completion"
          sublabel="Revert to pledged · 'times shown up' will decrement"
          icon={<UndoIcon color={colors.textSecondary} />}
          onPress={onUndo}
          last
        />
      </View>
    </>
  );
}

// Note input - standalone note without changing completion status
function SheetNote({
  habit,
  onSubmit,
  onCancel,
}: {
  habit: Habit;
  onSubmit: (note: string) => void;
  onCancel: () => void;
}) {
  const { colors } = useTheme();
  const [note, setNote] = useState('');

  return (
    <>
      <SheetHabitHeader habit={habit} />
      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        <Text style={[styles.messageTitle, { color: colors.textPrimary }]}>
          Add a note
        </Text>
        <Text style={[styles.partialHint, { color: colors.textSecondary }]}>
          Capture a thought without changing status.
        </Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
        <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
          What's on your mind?
        </Text>
        <TextInput
          style={[styles.noteInput, { backgroundColor: colors.surfaceAlt, color: colors.textPrimary }]}
          placeholder="e.g. Felt tired but still thinking about it..."
          placeholderTextColor={colors.textTertiary}
          value={note}
          onChangeText={setNote}
          multiline
        />
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 18, flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.surfaceAlt }]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.noteSubmitButton, { backgroundColor: note.trim() ? colors.accent : colors.surfaceAlt }]}
          onPress={() => note.trim() && onSubmit(note.trim())}
          disabled={!note.trim()}
        >
          <NoteIcon color={note.trim() ? '#fff' : colors.textTertiary} />
          <Text style={[styles.noteSubmitText, { color: note.trim() ? '#fff' : colors.textTertiary }]}>
            Save note
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

// Main bottom sheet wrapper with backdrop
export function HabitBottomSheet({
  visible,
  habit,
  variant: initialVariant,
  onClose,
  onMarkComplete,
  onMarkPartial,
  onSkip,
  onUndo,
  onPledgeFirst,
  onViewDetails,
  onAddNote,
}: HabitBottomSheetProps) {
  const { colors } = useTheme();
  const [internalVariant, setInternalVariant] = useState<SheetVariant>(initialVariant);
  const [modalVisible, setModalVisible] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setInternalVariant(initialVariant);
      slideAnim.setValue(screenHeight);
      backdropAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible]);

  const handleMarkComplete = () => {
    onMarkComplete();
    setInternalVariant('completed');
  };

  const handlePartialSubmit = (value: number, note?: string) => {
    onMarkPartial(value, note);
    setInternalVariant('completed');
  };

  const handleNoteSubmit = (note: string) => {
    onAddNote(note);
    setInternalVariant(initialVariant);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 50) onClose();
      },
    })
  ).current;

  const handleUndo = () => {
    onUndo();
    setInternalVariant('pledged');
  };

  let body: React.ReactNode;
  switch (internalVariant) {
    case 'unpledged':
      body = (
        <SheetUnpledged
          habit={habit}
          onPledgeFirst={onPledgeFirst}
          onMarkComplete={handleMarkComplete}
        />
      );
      break;
    case 'pledged':
      body = (
        <SheetPledged
          habit={habit}
          onMarkComplete={handleMarkComplete}
          onPartial={() => setInternalVariant('partial')}
          onSkip={onSkip}
          onAddNote={() => setInternalVariant('note')}
        />
      );
      break;
    case 'partial':
      body = (
        <SheetPartial
          habit={habit}
          onSubmit={handlePartialSubmit}
          onCancel={() => setInternalVariant('pledged')}
        />
      );
      break;
    case 'completed':
      body = <SheetCompleted habit={habit} onUndo={handleUndo} onClose={onClose} onViewDetails={onViewDetails} onAddNote={() => setInternalVariant('note')} />;
      break;
    case 'note':
      body = (
        <SheetNote
          habit={habit}
          onSubmit={handleNoteSubmit}
          onCancel={() => setInternalVariant(initialVariant)}
        />
      );
      break;
  }

  if (!modalVisible) return null;

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.backdrop}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)', opacity: backdropAnim }]}>
            <Pressable style={{ flex: 1 }} onPress={onClose} />
          </Animated.View>
          <Animated.View style={[styles.sheet, { backgroundColor: colors.bg, transform: [{ translateY: slideAnim }] }]}>
            <View {...panResponder.panHandlers} style={styles.dragZone}>
              <SheetHandle />
            </View>
            {body}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
    maxHeight: '88%',
  },

  // Handle
  handleRow: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragZone: {
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 999,
    opacity: 0.5,
  },

  // Header
  header: {
    paddingVertical: 6,
    paddingHorizontal: 24,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
  },
  headerStrip: {
    width: 4,
    height: 40,
    borderRadius: 999,
  },
  headerName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  headerGoal: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13.5,
    marginTop: 3,
  },

  // Primary action button
  primaryAction: {
    marginTop: 14,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 15,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryActionText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.1,
  },

  // Option rows
  option: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 48,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15.5,
    letterSpacing: -0.1,
    lineHeight: 19,
  },
  optionSublabel: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12.5,
    marginTop: 2,
  },

  // Pledged badge
  pledgedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  pledgedBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Done badge
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    paddingLeft: 7,
    borderRadius: 999,
  },
  doneBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Message area (unpledged)
  messageBox: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 6,
  },
  messageTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    letterSpacing: -0.1,
  },
  messageSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14.5,
    marginTop: 6,
    lineHeight: 21.75,
  },

  // Partial view
  partialHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  noteLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  noteInput: {
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 14,
    fontFamily: 'Nunito_500Medium',
    fontSize: 14.5,
    lineHeight: 21.75,
    minHeight: 68,
    textAlignVertical: 'top',
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
  },
  cancelText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14.5,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 6,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
  },
  stepperValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  stepperUnit: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Completed view
  completedCenter: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  completedCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  completedTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 19,
    letterSpacing: -0.2,
  },
  completedSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13.5,
    marginTop: 4,
  },
    // Note view
  cancelButton: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14.5,
    letterSpacing: -0.05,
  },
  noteSubmitButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noteSubmitText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14.5,
    letterSpacing: -0.05,
  },
});