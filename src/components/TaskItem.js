import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize, priorityColors } from '../theme/theme';
import Card from './Card';

export default function TaskItem({ task, onPress, onToggleComplete, group, showCompletedDate }) {
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffTime = d - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: colors.danger };
    if (diffDays === 0) return { text: 'Today', color: colors.warning };
    if (diffDays === 1) return { text: 'Tomorrow', color: colors.secondary };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: colors.textLight };
    return { text: d.toLocaleDateString(), color: colors.textMuted };
  };

  const formatCompletedDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const dueDateInfo = formatDate(task.dueDate);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => onToggleComplete(task.id)}
          style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
          ]}
        >
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>

          <View style={styles.meta}>
            {group && (
              <View style={[styles.groupBadge, { backgroundColor: group.color + '30' }]}>
                <Text style={[styles.groupText, { color: group.color }]}>{group.name}</Text>
              </View>
            )}

            {showCompletedDate && task.completedAt ? (
              <Text style={styles.completedDate}>
                Done: {formatCompletedDate(task.completedAt)}
              </Text>
            ) : (
              dueDateInfo && (
                <Text style={[styles.dueDate, { color: dueDateInfo.color }]}>
                  {dueDateInfo.text}
                </Text>
              )
            )}
          </View>
        </View>

        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: priorityColors[task.priority] },
          ]}
        />
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  groupBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  groupText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  dueDate: {
    fontSize: fontSize.xs,
  },
  completedDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    minHeight: 40,
    borderRadius: 2,
    marginLeft: spacing.sm,
  },
});
