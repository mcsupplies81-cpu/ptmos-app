export const Colors = {
  // Brand
  accent: '#2D6A4F',
  accentLight: '#52B788',
  accentDark: '#1B4332',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',

  // Cards & borders
  card: '#F2F3F5',
  cardBorder: '#E5E7EB',
  border: '#E5E7EB',

  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  mutedText: '#6B7280',

  // Status
  white: '#FFFFFF',
  error: '#DC2626',
  warning: '#D97706',
  success: '#2D6A4F',

  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabActive: '#2D6A4F',
  tabInactive: '#9CA3AF',
} as const;

export type ColorKey = keyof typeof Colors;
export default Colors;
