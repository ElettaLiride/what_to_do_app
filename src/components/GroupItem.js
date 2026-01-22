import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme/theme';
import Card from './Card';

export default function GroupItem({ group, taskCount, onPress }) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.colorDot, { backgroundColor: group.color }]} />
        <View style={styles.content}>
          <Text style={styles.name}>{group.name}</Text>
          <Text style={styles.count}>
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
  },
});
