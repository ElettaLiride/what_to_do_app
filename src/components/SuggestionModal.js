import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, priorityColors, priorityLabels } from '../theme/theme';
import Button from './Button';

export default function SuggestionModal({
  visible,
  onClose,
  task,
  group,
  onSkip,
  onViewTask,
  onLetsDoIt,
}) {
  if (!task) return null;

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, shadows.lg]}>
              <Text style={styles.header}>How about this?</Text>

              <View style={styles.taskCard}>
                <Text style={styles.taskTitle}>{task.title}</Text>

                {task.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}

                <View style={styles.meta}>
                  {group && (
                    <View style={[styles.badge, { backgroundColor: group.color + '30' }]}>
                      <Text style={[styles.badgeText, { color: group.color }]}>
                        {group.name}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.badge, { backgroundColor: priorityColors[task.priority] + '50' }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                      {priorityLabels[task.priority]}
                    </Text>
                  </View>

                  {task.dueDate && (
                    <Text style={styles.dueDate}>
                      Due: {formatDate(task.dueDate)}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.buttons}>
                <Button
                  title="Skip"
                  variant="outline"
                  onPress={onSkip}
                  style={styles.button}
                />
                <Button
                  title="Let's do it!"
                  onPress={onLetsDoIt}
                  style={styles.button}
                />
              </View>

              <Button
                title="View Details"
                variant="ghost"
                onPress={onViewTask}
                style={styles.viewButton}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  taskCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  taskTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  dueDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  viewButton: {
    marginTop: spacing.md,
  },
});
