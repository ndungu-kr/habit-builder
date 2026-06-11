// Light mode tokens - matched to the design handoff
export const lightColors = {
  // Backgrounds
  bg: '#FAF8F5',
  surface: '#F2EDE7',
  surfaceAlt: '#EBE4DB',
  border: 'rgba(60, 50, 40, 0.08)',

  // Text hierarchy
  textPrimary: '#2C2C2C',
  textSecondary: '#7A7068',
  textTertiary: '#A89B90',

  // Interactive
  accent: '#C4835A',
  accentSoft: 'rgba(196, 131, 90, 0.12)',

  // Status
  success: '#7DA68A',
  partial: '#D4A96A',
  missed: '#C4837A',

  // Named habit accent colors for the card left strip
  habitTerracotta: '#C4835A',
  habitSage: '#7DA68A',
  habitPeach: '#D4A96A',
  habitMauve: '#A98AB8',
  habitSky: '#7AA2C0',

  // Kept as an array for the color picker in habit creation
  habitColors: ['#C4835A', '#7DA68A', '#D4A96A', '#A98AB8', '#7AA2C0'],

  // Named why card pastels - randomly assigned as card backgrounds
  whyLavender: '#B8A9D4',
  whyDustyRose: '#D4A9B8',
  whySky: '#A9C4D4',
  whySage: '#A9D4B8',
  whyPeach: '#D4C0A9',
  whyPeriwinkle: '#A9B8D4',
  whyBlush: '#D4B0A9',
  whySeafoam: '#A9D4CC',
  whyMauve: '#C4A9D4',
  whyGold: '#D4CCA9',

  // As an array for random assignment
  whyCardColors: [
    '#B8A9D4', '#D4A9B8', '#A9C4D4', '#A9D4B8', '#D4C0A9',
    '#A9B8D4', '#D4B0A9', '#A9D4CC', '#C4A9D4', '#D4CCA9',
  ],
};

// Dark mode - same roles, adjusted for dark backgrounds
export const darkColors = {
  bg: '#1C1A18',
  surface: '#2A2725',
  surfaceAlt: '#332F2C',
  border: 'rgba(240, 235, 227, 0.08)',

  textPrimary: '#F0EBE3',
  textSecondary: '#9A918A',
  textTertiary: '#6E665F',

  accent: '#D4975A',
  accentSoft: 'rgba(212, 151, 90, 0.16)',

  success: '#8AB89A',
  partial: '#D4A96A',
  missed: '#D4938A',

  habitTerracotta: '#D4975A',
  habitSage: '#8AB89A',
  habitPeach: '#D4A96A',
  habitMauve: '#B8A0C8',
  habitSky: '#8AB0CC',

  habitColors: ['#D4975A', '#8AB89A', '#D4A96A', '#B8A0C8', '#8AB0CC'],

  whyLavender: '#7E70A4',
  whyDustyRose: '#A47E8E',
  whySky: '#7E96A8',
  whySage: '#7EA88E',
  whyPeach: '#A89478',
  whyPeriwinkle: '#7E8CA8',
  whyBlush: '#A88478',
  whySeafoam: '#7EA8A0',
  whyMauve: '#9078A4',
  whyGold: '#A8A078',

  whyCardColors: [
    '#7E70A4', '#A47E8E', '#7E96A8', '#7EA88E', '#A89478',
    '#7E8CA8', '#A88478', '#7EA8A0', '#9078A4', '#A8A078',
  ],
};

export type ColorTokens = typeof lightColors;