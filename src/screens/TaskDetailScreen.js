import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const isWeb = Platform.OS === 'web';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  priorityColors,
  priorityLabels,
} from '../theme/theme';
import { useApp } from '../context/AppContext';
import { Input, Button, Card } from '../components';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params || {};
  const { state, actions } = useApp();
  const isEditing = !!taskId;

  const existingTask = isEditing ? actions.getTaskById(taskId) : null;

  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [groupId, setGroupId] = useState(existingTask?.groupId || null);
  const [priority, setPriority] = useState(existingTask?.priority || 3);
  const [dueDate, setDueDate] = useState(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : null
  );
  const [subtasksToShow, setSubtasksToShow] = useState(existingTask?.subtasksToShow || 2);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const webDateInputRef = useRef(null);

  const isCompleted = existingTask?.completed || false;
  const completedAt = existingTask?.completedAt;
  const subtasks = existingTask?.subtasks || [];

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Task' : 'New Task',
    });
  }, [isEditing, navigation]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      groupId,
      priority,
      dueDate: dueDate?.toISOString() || null,
      subtasksToShow,
    };

    if (isEditing) {
      actions.updateTask(taskId, taskData);
    } else {
      actions.addTask(taskData);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (isWeb) {
      const confirmed = window.confirm('Are you sure you want to delete this task permanently?');
      if (confirmed) {
        actions.deleteTask(taskId);
        navigation.goBack();
      }
    } else {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task permanently?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              actions.deleteTask(taskId);
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleToggleComplete = () => {
    if (isCompleted) {
      actions.uncompleteTask(taskId);
    } else {
      actions.completeTask(taskId);
    }
  };

  const handleSetAsCurrent = () => {
    actions.setCurrentTask(taskId);
    navigation.goBack();
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleWebDateChange = (event) => {
    const dateString = event.target.value;
    if (dateString) {
      setDueDate(new Date(dateString + 'T12:00:00'));
    }
  };

  const openWebDatePicker = () => {
    if (webDateInputRef.current) {
      webDateInputRef.current.click();
    }
  };

  const clearDate = () => {
    setDueDate(null);
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim() && taskId) {
      actions.addSubtask(taskId, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (subtaskId) => {
    actions.toggleSubtask(taskId, subtaskId);
  };

  const handleDeleteSubtask = (subtaskId) => {
    actions.deleteSubtask(taskId, subtaskId);
  };

  const formatCompletedDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatWorkDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isCurrentTask = state.settings.currentTaskId === taskId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Completed Status Banner */}
      {isCompleted && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedBannerText}>
            Completed on {formatCompletedDate(completedAt)}
          </Text>
        </View>
      )}

      {/* Current Task Banner - Tappable to uncheck */}
      {isCurrentTask && !isCompleted && (
        <TouchableOpacity
          style={styles.currentBanner}
          onPress={() => actions.clearCurrentTask()}
          activeOpacity={0.7}
        >
          <Text style={styles.currentBannerText}>
            Currently working on this task
          </Text>
          <Text style={styles.currentBannerHint}>Tap to stop working on this</Text>
        </TouchableOpacity>
      )}

      {/* Title */}
      <Input
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="What needs to be done?"
        editable={!isCompleted}
      />

      {/* Description */}
      <Input
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Add more details..."
        multiline
        numberOfLines={4}
        editable={!isCompleted}
      />

      {/* Group */}
      <Text style={styles.label}>Group (optional)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.groupScroll}
      >
        <TouchableOpacity
          style={[styles.groupChip, groupId === null && styles.groupChipActive]}
          onPress={() => !isCompleted && setGroupId(null)}
          disabled={isCompleted}
        >
          <Text
            style={[styles.groupChipText, groupId === null && styles.groupChipTextActive]}
          >
            None
          </Text>
        </TouchableOpacity>
        {state.groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.groupChip,
              groupId === group.id && styles.groupChipActive,
              groupId === group.id && { backgroundColor: group.color },
            ]}
            onPress={() => !isCompleted && setGroupId(group.id)}
            disabled={isCompleted}
          >
            <View style={[styles.groupDot, { backgroundColor: group.color }]} />
            <Text
              style={[
                styles.groupChipText,
                groupId === group.id && styles.groupChipTextActive,
              ]}
            >
              {group.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Priority */}
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {[1, 2, 3, 4, 5].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.priorityButton,
              { backgroundColor: priorityColors[p] },
              priority === p && styles.priorityButtonActive,
            ]}
            onPress={() => !isCompleted && setPriority(p)}
            disabled={isCompleted}
          >
            <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
              {p}
            </Text>
            {priority === p && (
              <Text style={styles.priorityLabel}>{priorityLabels[p]}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Due Date */}
      <Text style={styles.label}>Due Date (optional)</Text>
      <View style={styles.dateRow}>
        {isWeb ? (
          /* Web: Use native HTML date input */
          <View style={styles.webDateContainer}>
            <input
              ref={webDateInputRef}
              type="date"
              value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
              onChange={handleWebDateChange}
              min={new Date().toISOString().split('T')[0]}
              disabled={isCompleted}
              style={{
                flex: 1,
                padding: 12,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #E8E5E0',
                backgroundColor: '#FFFFFF',
                color: '#3D3D3D',
                cursor: isCompleted ? 'not-allowed' : 'pointer',
              }}
            />
          </View>
        ) : (
          /* Native: Use TouchableOpacity to trigger DateTimePicker */
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => !isCompleted && setShowDatePicker(true)}
            disabled={isCompleted}
          >
            <Text style={styles.dateButtonText}>
              {dueDate
                ? dueDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Set due date'}
            </Text>
          </TouchableOpacity>
        )}
        {dueDate && !isCompleted && (
          <TouchableOpacity onPress={clearDate} style={styles.clearDateButton}>
            <Text style={styles.clearDateText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Native-only DateTimePicker */}
      {!isWeb && showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Subtasks Section - Only for existing tasks */}
      {isEditing && !isCompleted && (
        <>
          <Text style={styles.label}>Subtasks</Text>

          {/* Subtasks to show on home setting */}
          <View style={styles.subtasksSettingRow}>
            <Text style={styles.subtasksSettingLabel}>Show on home:</Text>
            <View style={styles.subtasksSettingButtons}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.subtasksSettingButton,
                    subtasksToShow === n && styles.subtasksSettingButtonActive,
                  ]}
                  onPress={() => setSubtasksToShow(n)}
                >
                  <Text
                    style={[
                      styles.subtasksSettingButtonText,
                      subtasksToShow === n && styles.subtasksSettingButtonTextActive,
                    ]}
                  >
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add new subtask */}
          <View style={styles.addSubtaskRow}>
            <Input
              placeholder="Add a subtask..."
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              onSubmitEditing={handleAddSubtask}
              returnKeyType="done"
              style={styles.subtaskInput}
            />
            <Button
              title="+"
              onPress={handleAddSubtask}
              disabled={!newSubtaskTitle.trim()}
              style={styles.addSubtaskButton}
            />
          </View>

          {/* Subtasks list */}
          {subtasks.length > 0 && (
            <Card style={styles.subtasksList}>
              {subtasks.map((subtask, index) => (
                <View
                  key={subtask.id}
                  style={[
                    styles.subtaskItem,
                    index < subtasks.length - 1 && styles.subtaskItemBorder,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.subtaskCheckbox,
                      subtask.completed && styles.subtaskCheckboxCompleted,
                    ]}
                    onPress={() => handleToggleSubtask(subtask.id)}
                  >
                    {subtask.completed && <Text style={styles.subtaskCheckmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.subtaskTitle,
                      subtask.completed && styles.subtaskTitleCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {subtask.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteSubtask(subtask.id)}
                    style={styles.subtaskDeleteButton}
                  >
                    <Text style={styles.subtaskDeleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          )}

          {subtasks.length === 0 && (
            <Text style={styles.noSubtasksText}>No subtasks yet</Text>
          )}
        </>
      )}

      {/* Show subtasks for completed tasks (read-only) */}
      {isEditing && isCompleted && subtasks.length > 0 && (
        <>
          <Text style={styles.label}>Subtasks</Text>
          <Card style={styles.subtasksList}>
            {subtasks.map((subtask, index) => (
              <View
                key={subtask.id}
                style={[
                  styles.subtaskItem,
                  index < subtasks.length - 1 && styles.subtaskItemBorder,
                ]}
              >
                <View
                  style={[
                    styles.subtaskCheckbox,
                    subtask.completed && styles.subtaskCheckboxCompleted,
                  ]}
                >
                  {subtask.completed && <Text style={styles.subtaskCheckmark}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.subtaskTitle,
                    subtask.completed && styles.subtaskTitleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {subtask.title}
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Work History Section */}
      {isEditing && existingTask?.workedOnDates && existingTask.workedOnDates.length > 0 && (
        <>
          <Text style={styles.label}>Work History</Text>
          <Card style={styles.workHistoryCard}>
            {existingTask.workedOnDates.map((date, index) => (
              <View
                key={index}
                style={[
                  styles.workHistoryItem,
                  index < existingTask.workedOnDates.length - 1 && styles.workHistoryItemBorder,
                ]}
              >
                <Text style={styles.workHistoryDate}>
                  {formatWorkDate(date)}
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!isCompleted && (
          <>
            <Button title={isEditing ? 'Save Changes' : 'Add Task'} onPress={handleSave} />
            {isEditing && !isCurrentTask && (
              <Button
                title="Set as Current Task"
                variant="outline"
                onPress={handleSetAsCurrent}
              />
            )}
          </>
        )}

        {isEditing && (
          <Button
            title={isCompleted ? 'Restore Task' : 'Mark as Done'}
            variant={isCompleted ? 'secondary' : 'outline'}
            onPress={handleToggleComplete}
          />
        )}

        {isEditing && (
          <Button
            title="Delete Permanently"
            variant="ghost"
            onPress={handleDelete}
            textStyle={{ color: colors.danger }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  completedBanner: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  completedBannerText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  currentBanner: {
    backgroundColor: colors.secondaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  currentBannerText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  currentBannerHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: 4,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  groupScroll: {
    marginBottom: spacing.md,
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  groupChipText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  groupChipTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    opacity: 0.6,
  },
  priorityButtonActive: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  priorityText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  priorityTextActive: {
    color: colors.text,
  },
  priorityLabel: {
    fontSize: fontSize.xs,
    color: colors.text,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  webDateContainer: {
    flex: 1,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  clearDateButton: {
    padding: spacing.md,
  },
  clearDateText: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  // Subtasks styles
  subtasksSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subtasksSettingLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginRight: spacing.sm,
  },
  subtasksSettingButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  subtasksSettingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtasksSettingButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subtasksSettingButtonText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontWeight: '500',
  },
  subtasksSettingButtonTextActive: {
    color: colors.white,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subtaskInput: {
    flex: 1,
    marginBottom: 0,
  },
  addSubtaskButton: {
    paddingHorizontal: spacing.lg,
  },
  subtasksList: {
    padding: spacing.sm,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  subtaskItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subtaskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCheckboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subtaskCheckmark: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  subtaskDeleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  subtaskDeleteText: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
    fontWeight: '300',
  },
  noSubtasksText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  // Work History styles
  workHistoryCard: {
    padding: spacing.sm,
  },
  workHistoryItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  workHistoryItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workHistoryDate: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
});
