import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { TaskItem } from '../components';

export default function TasksScreen({ navigation }) {
  const { state, actions } = useApp();
  const [showArchived, setShowArchived] = useState(false);
  const [filterGroupId, setFilterGroupId] = useState(null); // null = all

  // Get active or archived tasks based on toggle
  let filteredTasks = showArchived
    ? actions.getArchivedTasks()
    : actions.getActiveTasks();

  // Apply group filter (only for active tasks, archived shows all)
  if (!showArchived && filterGroupId !== null) {
    filteredTasks = filteredTasks.filter(task =>
      filterGroupId === 'ungrouped' ? task.groupId === null : task.groupId === filterGroupId
    );
  }

  // Sort: by due date, then by priority
  filteredTasks = [...filteredTasks].sort((a, b) => {
    // For archived tasks, sort by completed date (most recent first)
    if (showArchived) {
      return new Date(b.completedAt) - new Date(a.completedAt);
    }

    // For active tasks: due date first, then priority
    if (a.dueDate && b.dueDate) {
      const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateDiff !== 0) return dateDiff;
    }

    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    return b.priority - a.priority;
  });

  const handleToggleComplete = (taskId) => {
    const task = actions.getTaskById(taskId);
    if (task.completed) {
      // Uncomplete (restore from archive)
      actions.uncompleteTask(taskId);
    } else {
      // Complete (move to archive)
      actions.completeTask(taskId);
    }
  };

  const renderTask = ({ item }) => (
    <TaskItem
      task={item}
      group={actions.getGroupById(item.groupId)}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      onToggleComplete={handleToggleComplete}
      showCompletedDate={showArchived}
    />
  );

  const archivedCount = actions.getArchivedTasks().length;
  const activeCount = actions.getActiveTasks().length;

  return (
    <View style={styles.container}>
      {/* Tab Toggle: Active / Archived */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, !showArchived && styles.tabActive]}
          onPress={() => setShowArchived(false)}
        >
          <Text style={[styles.tabText, !showArchived && styles.tabTextActive]}>
            Active ({activeCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showArchived && styles.tabActive]}
          onPress={() => setShowArchived(true)}
        >
          <Text style={[styles.tabText, showArchived && styles.tabTextActive]}>
            Archived ({archivedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar - only for active tasks */}
      {!showArchived && (
        <View style={styles.filterBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: null, name: 'All' },
              { id: 'ungrouped', name: 'Ungrouped' },
              ...state.groups,
            ]}
            keyExtractor={(item) => item.id?.toString() || 'all'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterGroupId === item.id && styles.filterChipActive,
                ]}
                onPress={() => setFilterGroupId(item.id)}
              >
                {item.color && (
                  <View style={[styles.chipDot, { backgroundColor: item.color }]} />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    filterGroupId === item.id && styles.filterChipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>
      )}

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{showArchived ? '📦' : '✅'}</Text>
            <Text style={styles.emptyText}>
              {showArchived ? 'No archived tasks' : 'No tasks yet!'}
            </Text>
            <Text style={styles.emptySubtext}>
              {showArchived
                ? 'Completed tasks will appear here'
                : 'Add a task to get started'}
            </Text>
          </View>
        }
      />

      {/* Add Button - only for active tasks */}
      {!showArchived && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddTask')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterBar: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: colors.white,
  },
});
