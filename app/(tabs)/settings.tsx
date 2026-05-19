import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { typography } from '@/theme/typography';
import { spacing, radii, layout } from '@/theme/spacing';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { signOut } = useAuthStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Preferences and account options will appear here
      </Text>

      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={signOut}
      >
        <Text style={[styles.signOutText, { color: colors.missed }]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xxxl,
  },
  signOutButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.button,
    borderWidth: 1,
  },
  signOutText: {
    ...typography.body,
    fontWeight: '600',
  },
});