import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme/typography';
import { layout, spacing } from '@/theme/spacing';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Home</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Your habits will appear here
      </Text>
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
  },
});