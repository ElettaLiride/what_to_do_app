// Cozy Light Theme
export const colors = {
  background: '#FAFAF8',      // Warm white
  card: '#FFFFFF',            // Pure white
  primary: '#7CB69D',         // Soft sage green
  primaryLight: '#A8D5BA',    // Lighter sage
  secondary: '#E8A598',       // Warm coral
  secondaryLight: '#F5C7BE',  // Lighter coral
  text: '#3D3D3D',            // Soft charcoal
  textLight: '#6B6B6B',       // Lighter text
  textMuted: '#9A9A9A',       // Muted text
  border: '#E8E8E6',          // Subtle border
  success: '#7CB69D',         // Same as primary
  warning: '#F5C77E',         // Warm yellow
  danger: '#E88B8B',          // Soft red
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Priority colors (1=lowest, 5=highest)
export const priorityColors = {
  1: '#B8D4E3', // Light blue
  2: '#A8D5BA', // Light green
  3: '#F5E6A3', // Light yellow
  4: '#F5C7BE', // Light coral
  5: '#E88B8B', // Soft red
};

export const priorityLabels = {
  1: 'Very Low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Very High',
};
