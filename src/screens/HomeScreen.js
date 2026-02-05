import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { getNextSuggestion } from '../utils/taskSuggestion';
import {
  Input,
  Button,
  SuggestButton,
  FilterModal,
  SuggestionModal,
  DataManagementModal,
} from '../components';

export default function HomeScreen({ navigation }) {
  const { state, actions, isLoading, syncStatus } = useApp();
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [suggestionModalVisible, setSuggestionModalVisible] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [skippedIds, setSkippedIds] = useState([]);
  const [dataModalVisible, setDataModalVisible] = useState(false);

  // Set up gear icon in header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setDataModalVisible(true)}
          style={{ paddingHorizontal: spacing.md }}
        >
          <Text style={{ fontSize: fontSize.lg }}>&#9881;</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Get current task being worked on
  const currentTask = actions.getCurrentTask();
  const currentTaskGroup = currentTask ? actions.getGroupById(currentTask.groupId) : null;

  // Count active (non-completed) tasks
  const activeTasks = actions.getActiveTasks();
  const taskCount = activeTasks.length;

  const handleQuickAdd = () => {
    if (quickTaskTitle.trim()) {
      // Quick task: priority 3 by default, no other options
      actions.addTask({ title: quickTaskTitle.trim(), priority: 3 });
      setQuickTaskTitle('');
    }
  };

  const handleSuggest = () => {
    const suggestion = getNextSuggestion(
      state.tasks,
      state.groups,
      state.settings.suggestionGroupFilter,
      skippedIds
    );

    if (suggestion) {
      setCurrentSuggestion(suggestion);
      setSuggestionModalVisible(true);
    } else {
      // Reset skipped list if no more suggestions
      setSkippedIds([]);
      const newSuggestion = getNextSuggestion(
        state.tasks,
        state.groups,
        state.settings.suggestionGroupFilter,
        []
      );
      if (newSuggestion) {
        setCurrentSuggestion(newSuggestion);
        setSuggestionModalVisible(true);
      }
    }
  };

  const handleSkipSuggestion = () => {
    if (currentSuggestion) {
      setSkippedIds([...skippedIds, currentSuggestion.id]);
    }

    const nextSuggestion = getNextSuggestion(
      state.tasks,
      state.groups,
      state.settings.suggestionGroupFilter,
      [...skippedIds, currentSuggestion?.id]
    );

    if (nextSuggestion) {
      setCurrentSuggestion(nextSuggestion);
    } else {
      // No more suggestions, reset
      setSkippedIds([]);
      setSuggestionModalVisible(false);
    }
  };

  const handleLetsDoIt = () => {
    if (currentSuggestion) {
      // Set this task as the current task being worked on
      actions.setCurrentTask(currentSuggestion.id);
      setSuggestionModalVisible(false);
      setCurrentSuggestion(null);
    }
  };

  const handleViewSuggestedTask = () => {
    setSuggestionModalVisible(false);
    navigation.navigate('TaskDetail', { taskId: currentSuggestion.id });
  };

  const handleToggleGroup = (groupId) => {
    const current = state.settings.suggestionGroupFilter;

    if (groupId === null) {
      // Toggle "All Groups"
      actions.updateSettings({ suggestionGroupFilter: null });
    } else {
      if (current === null) {
        // Currently all selected, switch to only this one
        actions.updateSettings({ suggestionGroupFilter: [groupId] });
      } else {
        // Toggle specific group
        if (current.includes(groupId)) {
          const newFilter = current.filter(id => id !== groupId);
          actions.updateSettings({
            suggestionGroupFilter: newFilter.length > 0 ? newFilter : null,
          });
        } else {
          actions.updateSettings({
            suggestionGroupFilter: [...current, groupId],
          });
        }
      }
    }
  };

  const handleSelectAll = () => {
    actions.updateSettings({ suggestionGroupFilter: null });
  };

  const handleClearAll = () => {
    actions.updateSettings({ suggestionGroupFilter: [] });
  };

  // Reset skipped IDs when screen gains focus
  useFocusEffect(
    useCallback(() => {
      setSkippedIds([]);
    }, [])
  );

  // Handle marking current task as done
  const handleMarkAsDone = () => {
    if (currentTask) {
      actions.completeTask(currentTask.id);
    }
  };

  // Handle stop working on current task
  const handleStopWorking = () => {
    actions.clearCurrentTask();
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Count */}
        <View style={styles.header}>
          <Text style={styles.taskCountText}>
            <Text style={styles.taskCountNumber}>{taskCount}</Text>
            {' '}{taskCount === 1 ? 'task' : 'tasks'} to do
          </Text>
        </View>

        {/* Currently Working On */}
        <TouchableOpacity
          style={[styles.currentTaskCard, shadows.md]}
          onPress={() => {
            if (currentTask) {
              navigation.navigate('TaskDetail', { taskId: currentTask.id });
            }
          }}
          activeOpacity={currentTask ? 0.7 : 1}
        >
          <Text style={styles.currentTaskLabel}>Currently working on</Text>
          {currentTask ? (
            <View style={styles.currentTaskContent}>
              <Text style={styles.currentTaskTitle} numberOfLines={2}>
                {currentTask.title}
              </Text>
              {currentTaskGroup && (
                <View style={[styles.groupBadge, { backgroundColor: currentTaskGroup.color + '30' }]}>
                  <Text style={[styles.groupBadgeText, { color: currentTaskGroup.color }]}>
                    {currentTaskGroup.name}
                  </Text>
                </View>
              )}
              {/* Action buttons */}
              <View style={styles.currentTaskActions}>
                <TouchableOpacity
                  style={styles.actionButtonLeft}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleStopWorking();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonLeftText}>Stop working</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonRight}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleMarkAsDone();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonRightText}>Mark as Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noTaskContent}>
              <Text style={styles.sleepingEmoji}>😴</Text>
              <Text style={styles.noTaskText}>Nothing selected yet</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Subtasks for Current Task */}
        {currentTask && currentTask.subtasks && currentTask.subtasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            <Text style={styles.subtasksLabel}>Next steps:</Text>
            {actions.getIncompleteSubtasks(currentTask.id, currentTask.subtasksToShow || 2).map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={[styles.subtaskItem, shadows.sm]}
                onPress={() => actions.toggleSubtask(currentTask.id, subtask.id)}
                activeOpacity={0.7}
              >
                <View style={styles.subtaskCheckbox}>
                  {subtask.completed && <Text style={styles.subtaskCheckmark}>✓</Text>}
                </View>
                <Text style={styles.subtaskTitle} numberOfLines={2}>
                  {subtask.title}
                </Text>
              </TouchableOpacity>
            ))}
            {actions.getIncompleteSubtasks(currentTask.id).length > (currentTask.subtasksToShow || 2) && (
              <Text style={styles.moreSubtasksText}>
                +{actions.getIncompleteSubtasks(currentTask.id).length - (currentTask.subtasksToShow || 2)} more subtasks
              </Text>
            )}
          </View>
        )}

        {/* Quick Add */}
        <View style={styles.quickAdd}>
          <Input
            placeholder="Add a quick task..."
            value={quickTaskTitle}
            onChangeText={setQuickTaskTitle}
            onSubmitEditing={handleQuickAdd}
            returnKeyType="done"
            style={styles.quickInput}
          />
          <Button
            title="+"
            onPress={handleQuickAdd}
            disabled={!quickTaskTitle.trim()}
            style={styles.quickButton}
          />
        </View>

        {/* Suggest Button */}
        <View style={styles.suggestContainer}>
          <SuggestButton onPress={handleSuggest} />
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          >
            <Text style={styles.filterText}>Filter groups</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        groups={state.groups}
        selectedGroupIds={state.settings.suggestionGroupFilter}
        onToggleGroup={handleToggleGroup}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />

      {/* Suggestion Modal */}
      <SuggestionModal
        visible={suggestionModalVisible}
        onClose={() => setSuggestionModalVisible(false)}
        task={currentSuggestion}
        group={currentSuggestion ? actions.getGroupById(currentSuggestion.groupId) : null}
        onSkip={handleSkipSuggestion}
        onViewTask={handleViewSuggestedTask}
        onLetsDoIt={handleLetsDoIt}
      />

      {/* Data Management Modal */}
      <DataManagementModal
        visible={dataModalVisible}
        onClose={() => setDataModalVisible(false)}
        state={state}
        actions={actions}
        syncStatus={syncStatus}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  taskCountText: {
    fontSize: fontSize.lg,
    color: colors.textLight,
  },
  taskCountNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  currentTaskCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 120,
  },
  currentTaskLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  currentTaskContent: {
    flex: 1,
    justifyContent: 'center',
  },
  currentTaskTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  groupBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  groupBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  currentTaskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButtonLeft: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  actionButtonLeftText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontWeight: '500',
  },
  actionButtonRight: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  actionButtonRightText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: '500',
  },
  noTaskContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepingEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  noTaskText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  quickAdd: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickInput: {
    flex: 1,
    marginBottom: 0,
  },
  quickButton: {
    paddingHorizontal: spacing.lg,
  },
  suggestContainer: {
    marginTop: spacing.md,
  },
  filterButton: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  subtasksContainer: {
    marginBottom: spacing.lg,
  },
  subtasksLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  subtaskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCheckmark: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  moreSubtasksText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
