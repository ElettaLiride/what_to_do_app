import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) {
  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.white;
      case 'outline': return colors.primary;
      case 'ghost': return colors.text;
      default: return colors.white;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'lg': return { paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xl };
      default: return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return fontSize.sm;
      case 'lg': return fontSize.lg;
      default: return fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        getPadding(),
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        !disabled && variant !== 'ghost' && shadows.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
              icon && { marginLeft: spacing.sm },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  text: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
});
