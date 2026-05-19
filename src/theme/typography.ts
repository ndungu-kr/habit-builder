// Typography scale from the design brief
// Each style has a role (what it's used for), not just a size
// This keeps text consistent: every headline looks the same across all screens

export const typography = {
  // Display - the biggest text, used sparingly: milestone celebrations, streak count
  display: {
    fontSize: 30,
    fontWeight: '600' as const,  // SemiBold
    lineHeight: 39,              // 1.3x the font size
  },

  // H1 - screen headlines like "Good morning" or "Let's look back at today"
  h1: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 31.2,
  },

  // H2 - section headers, habit names on cards
  h2: {
    fontSize: 20,
    fontWeight: '500' as const,  // Medium
    lineHeight: 26,
  },

  // Body - the workhorse: descriptions, reflections, pledge statements
  body: {
    fontSize: 16,
    fontWeight: '400' as const,  // Regular
    lineHeight: 24,              // 1.5x - more breathing room for readable paragraphs
  },

  // Caption - labels, "times shown up" counters, timestamps
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,
  },

  // Small - badges, tooltip text, freeze balance display
  small: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
};