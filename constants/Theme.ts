import Colors from './Colors';

export const Theme = {
  colors: Colors,
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  font: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xxl: 28, xxxl: 34 },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
  },
} as const;

export default Theme;
