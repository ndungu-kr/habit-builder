// Light mode color tokens - warm, earthy palette 
// Every color has a "role" (what it's used for) not a "name" (what it looks like)
// This means we use "accent" not "terracotta" 

export const lightColors = {
  // Backgrounds
  bg: '#FAF8F5',              // Primary background - warm off-white, never pure white
  surface: '#F2EDE7',         // Cards, bottom sheets, elevated surfaces
  surfaceAlt: '#EBE4DB',      // Alternative surface for subtle contrast
  border: 'rgba(60, 50, 40, 0.08)', // Very subtle borders

  // Text
  textPrimary: '#2C2C2C',     // Headlines, body text - warm charcoal, not pure black
  textSecondary: '#7A7068',   // Supporting text, labels, timestamps
  textTertiary: '#A89B90',    // Least important text, hints

  // Interactive
  accent: '#C4835A',          // CTAs, active states, streak counter - warm terracotta
  accentSoft: 'rgba(196, 131, 90, 0.12)', // Subtle accent backgrounds

  // Status indicators - these map to habit completion states
  success: '#7DA68A',         // Completed - muted sage green, not sharp green
  partial: '#D4A96A',         // Partial completion - warm gold
  missed: '#C4837A',          // Missed/skipped - soft rose, not alarming red

  // Habit card accent colors - the colored left strip on each habit card
  habitColors: ['#C4835A', '#7DA68A', '#D4A96A', '#A98AB8', '#7AA2C0'],

  // Why card pastel palette - randomly assigned as card backgrounds
  // These need to be soft enough that white text stays readable on top
  whyCardColors: [
    '#B8A9D4', // Soft lavender
    '#D4A9B8', // Dusty rose
    '#A9C4D4', // Muted sky
    '#A9D4B8', // Sage
    '#D4C0A9', // Warm peach
    '#A9B8D4', // Soft periwinkle
    '#D4B0A9', // Blush
    '#A9D4CC', // Seafoam
    '#C4A9D4', // Mauve
    '#D4CCA9', // Soft gold
  ],
};

// Dark mode color tokens - same roles, adjusted for dark backgrounds
// Colors are slightly more saturated to feel right against dark surfaces
export const darkColors = {
  bg: '#1C1A18',
  surface: '#2A2725',
  surfaceAlt: '#332F2C',
  border: 'rgba(240, 235, 227, 0.08)',

  textPrimary: '#F0EBE3',
  textSecondary: '#9A918A',
  textTertiary: '#6E665F',

  accent: '#D4975A',          // Slightly warmer amber in dark mode
  accentSoft: 'rgba(212, 151, 90, 0.16)',

  success: '#8AB89A',
  partial: '#D4A96A',
  missed: '#D4938A',

  habitColors: ['#D4975A', '#8AB89A', '#D4A96A', '#B8A0C8', '#8AB0CC'],

  whyCardColors: [
    '#7E70A4',
    '#A47E8E',
    '#7E96A8',
    '#7EA88E',
    '#A89478',
    '#7E8CA8',
    '#A88478',
    '#7EA8A0',
    '#9078A4',
    '#A8A078',
  ],
};

// TypeScript type - so any code using colors gets autocomplete and type checking
export type ColorTokens = typeof lightColors;