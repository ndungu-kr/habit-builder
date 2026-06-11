// Nunito font scale - each weight is a separate font file in React Native
// so we reference the loaded font name directly instead of using fontWeight

export const typography = {
  // Milestone celebrations, streak count
  display: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 30,
    lineHeight: 39,
  },

  // Screen headlines - "Good morning", "Today's Pledge"
  h1: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 24,
    lineHeight: 31.2,
  },

  // Section headers, habit names on cards
  h2: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 20,
    lineHeight: 26,
  },

  // Body text, reflections, descriptions
  body: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },

  // Labels, "times shown up", timestamps
  caption: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },

  // Badges, tooltip text, freeze balance
  small: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    lineHeight: 18,
  },
};