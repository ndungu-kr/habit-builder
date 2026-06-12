import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { Profile } from '@/types';
import { Svg, Path, Circle, Rect, G } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';

// ─── Inline icons (from handoff) ───

function MorningIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
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

function EveningIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
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

function BellIcon({ color }: { color: string }) {
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

function TrophyIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5h8v5a4 4 0 0 1-8 0V5z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M8 7H5v2a3 3 0 0 0 3 3M16 7h3v2a3 3 0 0 1-3 3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M9 19h6M12 14v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function UserIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 20a8 8 0 0 1 16 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MoonIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={3.5} y={5} width={17} height={15} rx={2} stroke={color} strokeWidth={1.8} />
      <Path d="M8 3v4M16 3v4M4 10h16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function HelpIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.8} />
      <Path
        d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 1-1 1.7v.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={17} r={1} fill={color} />
    </Svg>
  );
}

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SignOutIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Reusable row components ───

function SGroupLabel({
  label,
  sub,
  colors,
}: {
  label: string;
  sub?: string;
  colors: any;
}) {
  return (
    <View style={{ paddingHorizontal: 28, paddingBottom: 8 }}>
      <Text
        style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: 11.5,
          color: colors.textSecondary,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      {sub && (
        <Text
          style={{
            fontFamily: 'Nunito_500Medium',
            fontSize: 12.5,
            color: colors.textTertiary,
            marginTop: 3,
          }}
        >
          {sub}
        </Text>
      )}
    </View>
  );
}

function SGroup({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function SRow({
  label,
  sublabel,
  icon,
  trailing,
  danger,
  last,
  accentIcon,
  onPress,
  colors,
}: {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  danger?: boolean;
  last?: boolean;
  accentIcon?: boolean;
  onPress?: () => void;
  colors: any;
}) {
  const content = (
    <View
      style={{
        padding: 14,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        minHeight: 48,
      }}
    >
      {icon && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: accentIcon
              ? colors.accentSoft
              : danger
              ? 'rgba(196,131,122,0.12)'
              : colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 15,
            color: danger ? colors.missed : colors.textPrimary,
            letterSpacing: -0.05,
          }}
        >
          {label}
        </Text>
        {sublabel && (
          <Text
            style={{
              fontFamily: 'Nunito_500Medium',
              fontSize: 12.5,
              color: colors.textSecondary,
              marginTop: 2,
              lineHeight: 17,
            }}
          >
            {sublabel}
          </Text>
        )}
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }
  return content;
}

function TimeTrailing({ time, colors }: { time: string; colors: any }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: colors.surfaceAlt,
      }}
    >
      <Text
        style={{
          fontFamily: 'Nunito_700Bold',
          fontSize: 14,
          color: colors.textPrimary,
          letterSpacing: -0.05,
        }}
      >
        {time}
      </Text>
      <ChevronRight color={colors.textTertiary} />
    </View>
  );
}

function Segmented({
  options,
  active,
  onSelect,
  colors,
}: {
  options: string[];
  active: string;
  onSelect: (opt: string) => void;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        borderRadius: 10,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: isActive ? colors.bg : 'transparent',
              ...(isActive && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }),
            }}
          >
            <Text
              style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 12.5,
                color: isActive ? colors.textPrimary : colors.textSecondary,
                letterSpacing: -0.05,
              }}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Profile card ───

function ProfileCard({ colors }: { colors: any }) {
  const { user } = useAuthStore();
  const { profile } = useProfileStore();

  const email = user?.email ?? '';
  const name = profile?.name ?? email.split('@')[0] ?? 'User';
  const initial = name.charAt(0).toUpperCase();

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <View
      style={{
        marginHorizontal: 20,
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          backgroundColor: colors.habitSage,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Nunito_800ExtraBold',
            fontSize: 22,
            color: '#fff',
            letterSpacing: -0.5,
          }}
        >
          {initial}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: 18,
            color: colors.textPrimary,
            letterSpacing: -0.2,
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontFamily: 'Nunito_500Medium',
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          {email}
        </Text>
        {memberSince ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <Text
              style={{
                fontFamily: 'Nunito_600SemiBold',
                fontSize: 12,
                color: colors.textTertiary,
                letterSpacing: 0.2,
              }}
            >
              Member since {memberSince}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ─── Helper: format time for display ───

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
}

// ─── Main settings screen ───

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { signOut } = useAuthStore();
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  const router = useRouter();

  // Which time field is being edited, null means picker is hidden
  const [editingTime, setEditingTime] = useState<'morning' | 'evening' | null>(null);
  const [pendingTime, setPendingTime] = useState<Date | null>(null);
  
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // Convert a "HH:MM" string to a Date object for the picker
  const timeToDate = (timeStr: string): Date => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h || 8, m || 0, 0, 0);
    return d;
  };

    // Track the spinner value as the user scrolls - don't close yet
  const handleTimeScroll = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setPendingTime(selectedDate);
    }
  };

  // Only save when the user taps Done
  const handleTimeDone = async () => {
    if (!editingTime || !pendingTime) {
      setEditingTime(null);
      setPendingTime(null);
      return;
    }

    const h = pendingTime.getHours();
    const m = pendingTime.getMinutes();
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    const field = editingTime === 'morning' ? 'morning_reminder_time' : 'evening_reminder_time';
    setEditingTime(null);
    setPendingTime(null);

    await updateProfile({ [field]: timeStr });
  };

  const handleToggle = async (field: keyof Profile, value: boolean) => {
    await updateProfile({ [field]: value } as Partial<Profile>);
  };

  const handleThemeChange = async (opt: string) => {
    const val = opt.toLowerCase() as 'light' | 'dark' | 'system';
    await updateProfile({ theme: val });
  };

  const handleWeekStartChange = async (opt: string) => {
    const val = opt === 'Mon' ? 'monday' : 'sunday';
    await updateProfile({ week_start_day: val });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This is permanent. All your data will be removed and cannot be recovered.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: implement actual account deletion
            Alert.alert('Not yet available', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  const themeLabel =
    profile?.theme === 'light' ? 'Light' : profile?.theme === 'dark' ? 'Dark' : 'System';
  const weekLabel = profile?.week_start_day === 'sunday' ? 'Sun' : 'Mon';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ height: 50 }} />

        {/* Nav title */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 14 }}>
          <Text
            style={{
              fontFamily: 'Nunito_800ExtraBold',
              fontSize: 32,
              color: colors.textPrimary,
              letterSpacing: -0.6,
            }}
          >
            Settings
          </Text>
        </View>

        {/* Profile card */}
        <View style={{ paddingTop: 6 }}>
          <ProfileCard colors={colors} />
        </View>

        {/* Notifications */}
        <View style={{ paddingTop: 28 }}>
          <SGroupLabel
            label="Notifications"
            sub="Only fire on days with scheduled habits."
            colors={colors}
          />
          <SGroup colors={colors}>
            <SRow
              colors={colors}
              label="Morning pledge"
              sublabel="When to set your intention"
              icon={<MorningIcon color={colors.accent} />}
              accentIcon
              onPress={() => {
                setPendingTime(profile ? timeToDate(profile.morning_reminder_time) : new Date());
                setEditingTime('morning');
              }}
              trailing={
                <TimeTrailing
                  time={profile ? formatTime(profile.morning_reminder_time) : '8:00 AM'}
                  colors={colors}
                />
              }
            />
            <SRow
              colors={colors}
              label="Evening check-in"
              sublabel="When to reflect on your day"
              icon={<EveningIcon color={colors.textSecondary} />}
              onPress={() => {
                setPendingTime(profile ? timeToDate(profile.evening_reminder_time) : new Date());
                setEditingTime('evening');
              }}
              trailing={
                <TimeTrailing
                  time={profile ? formatTime(profile.evening_reminder_time) : '9:00 PM'}
                  colors={colors}
                />
              }
            />
            <SRow
              colors={colors}
              label="Afternoon nudge"
              sublabel="A gentle reminder if a habit is still unmarked"
              icon={<BellIcon color={colors.textSecondary} />}
              trailing={
                <Switch
                  value={profile?.afternoon_nudge_enabled ?? false}
                  onValueChange={(val) => handleToggle('afternoon_nudge_enabled', val)}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#fff"
                  ios_backgroundColor={colors.border}
                />
              }
            />
            <SRow
              colors={colors}
              label="Milestone celebrations"
              sublabel="A push notification when you hit a milestone"
              icon={<TrophyIcon color={colors.textSecondary} />}
              trailing={
                <Switch
                  value={profile?.milestone_notifications_enabled ?? true}
                  onValueChange={(val) => handleToggle('milestone_notifications_enabled', val)}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#fff"
                  ios_backgroundColor={colors.border}
                />
              }
              last
            />
          </SGroup>
        </View>

        {/* App preferences */}
        <View style={{ paddingTop: 28 }}>
          <SGroupLabel label="App preferences" colors={colors} />
          <SGroup colors={colors}>
            <SRow
              colors={colors}
              label="Theme"
              icon={<MoonIcon color={colors.textSecondary} />}
              trailing={
                <Segmented
                  options={['Light', 'Dark', 'System']}
                  active={themeLabel}
                  onSelect={handleThemeChange}
                  colors={colors}
                />
              }
            />
            <SRow
              colors={colors}
              label="First day of week"
              icon={<CalendarIcon color={colors.textSecondary} />}
              trailing={
                <Segmented
                  options={['Sun', 'Mon']}
                  active={weekLabel}
                  onSelect={handleWeekStartChange}
                  colors={colors}
                />
              }
              last
            />
          </SGroup>
        </View>

        {/* Account */}
        <View style={{ paddingTop: 28 }}>
          <SGroupLabel label="Account" colors={colors} />
          <SGroup colors={colors}>
            <SRow
              colors={colors}
              label="Sign out"
              sublabel="You can always sign back in"
              icon={<SignOutIcon color={colors.textSecondary} />}
              trailing={<ChevronRight color={colors.textTertiary} />}
              onPress={handleSignOut}
            />
            <SRow
              colors={colors}
              label="Delete account"
              sublabel="Permanent - all data is removed"
              icon={<TrashIcon color={colors.missed} />}
              trailing={<ChevronRight color={colors.missed} />}
              danger
              onPress={handleDeleteAccount}
              last
            />
          </SGroup>
        </View>

        {/* Help */}
        <View style={{ paddingTop: 28, paddingBottom: 32 }}>
          <SGroup colors={colors}>
            <SRow
              colors={colors}
              label="Help & how it works"
              sublabel="Streaks, freezes, partial credit"
              icon={<HelpIcon color={colors.textSecondary} />}
              trailing={<ChevronRight color={colors.textTertiary} />}
              last
            />
          </SGroup>
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontFamily: 'Nunito_600SemiBold',
              fontSize: 12,
              color: colors.textTertiary,
            }}
          >
            Habit Builder - v0.1.0
          </Text>
        </View>
      </ScrollView>
            {/* Native iOS time picker - slides up when a time pill is tapped */}
      {editingTime && (
        <Modal transparent animationType="fade">
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'flex-end',
            }}
            onPress={() => setEditingTime(null)}
          >
            <Pressable
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 30,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Nunito_700Bold',
                    fontSize: 17,
                    color: colors.textPrimary,
                  }}
                >
                  {editingTime === 'morning' ? 'Morning pledge time' : 'Evening check-in time'}
                </Text>
                <TouchableOpacity onPress={handleTimeDone}>
                  <Text
                    style={{
                      fontFamily: 'Nunito_700Bold',
                      fontSize: 15,
                      color: colors.accent,
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={
                  profile
                    ? timeToDate(
                        editingTime === 'morning'
                          ? profile.morning_reminder_time
                          : profile.evening_reminder_time
                      )
                    : new Date()
                }
                mode="time"
                display="spinner"
                onChange={handleTimeScroll}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}