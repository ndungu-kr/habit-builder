// 8px grid spacing system from the design brief
// Every margin, padding, and gap in the app uses one of these values
// This keeps everything aligned and visually consistent
export const spacing = {
  xs: 4,      // Half-step - tight spaces like icon-to-label gaps
  sm: 8,      // 1x base - minimum breathing room
  md: 12,     // 1.5x - gap between cards in a list
  lg: 16,     // 2x - standard card padding, section gaps
  xl: 20,     // 2.5x - screen edge padding
  xxl: 24,    // 3x - large card padding (pledge cards, milestones)
  xxxl: 32,   // 4x - major section separators
  xxxxl: 48,  // 6x - hero spacing (top of screen to first content)
};

// Corner radii - how rounded things are
// The design brief says minimum 12px everywhere - nothing should feel sharp
export const radii = {
  card: 16,       // Habit cards, why cards, surface containers
  sheet: 24,      // Bottom sheets (top corners only)
  button: 12,     // Primary CTA buttons
  input: 12,      // Text input fields
  badge: 999,     // Pill shape - badges, chips, streak counter
};

// Reusable layout constants so screen files stay clean
// Instead of remembering "was card padding 16 or 24?", use these
export const layout = {
  screenPadding: spacing.xl,      // 20px - horizontal padding on all screens
  cardPadding: spacing.lg,        // 16px - standard internal card padding
  cardPaddingLarge: spacing.xxl,  // 24px - pledge cards, milestone celebrations
  cardGap: spacing.md,            // 12px - space between cards in a list
};