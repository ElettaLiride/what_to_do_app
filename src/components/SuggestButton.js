import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme/theme';

export default function SuggestButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, shadows.lg]}
    >
      <Text style={styles.icon}>✨</Text>
      <Text style={styles.text}>What should I do?</Text>
      <Text style={styles.subtext}>Tap for a suggestion</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  subtext: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
});
