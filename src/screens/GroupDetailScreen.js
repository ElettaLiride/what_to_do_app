import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { TaskItem, Button, Input } from '../components';

export default function GroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { state, actions } = useApp();
  const [showCompleted, setShowCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const group = groupId !== null ? actions.getGroupById(groupId) : null;
  const isUngrouped = groupId === null;

  // Get tasks for this group
  let tasks = state.tasks.filter(task =>
    isUngrouped ? task.groupId === null : task.groupId === groupId
  );

  if (!showCompleted) {
    tasks = tasks.filter(task => !task.completed);
  }

  // Sort tasks
  tasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDate && b.dueDate) {
      const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateDiff !== 0) return dateDiff;
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return b.priority - a.priority;
  });

  const completedCount = state.tasks.filter(
    t => (isUngrouped ? t.groupId === null : t.groupId === groupId) && t.completed
  ).length;

  React.useEffect(() => {
    navigation.setOptions({
      title: isUngrouped ? 'Ungrouped' : group?.name || 'Group',
      headerRight: () =>
        !isUngrouped ? (
          <TouchableOpacity
            onPress={() => {
              setEditName(group?.name || '');
              setIsEditing(true);
            }}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, group, isUngrouped]);

  const handleSaveEdit = () => {
    if (editName.trim() && group) {
      actions.updateGroup(groupId, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure? Tasks in this group will become ungrouped.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            actions.deleteGroup(groupId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderTask = ({ item }) => (
    <TaskItem
      task={item}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      onToggleComplete={actions.toggleTaskComplete}
    />
  );

  if (isEditing && group) {
    return (
      <View style={styles.editContainer}>
        <Text style={styles.editTitle}>Edit Group</Text>
        <Input
          label="Group Name"
          value={editName}
          onChangeText={setEditName}
          autoFocus
        />
        <View style={styles.editActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setIsEditing(false)}
            style={styles.editButton}
          />
          <Button
            title="Save"
            onPress={handleSaveEdit}
            disabled={!editName.trim()}
            style={styles.editButton}
          />
        </View>
        <Button
          title="Delete Group"
          variant="ghost"
          onPress={handleDeleteGroup}
          textStyle={{ color: colors.danger }}
          style={styles.deleteButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Group Header */}
      {group && (
        <View style={styles.header}>
          <View style={[styles.colorBar, { backgroundColor: group.color }]} />
          <Text style={styles.taskCount}>
            {tasks.filter(t => !t.completed).length} active{' '}
            {tasks.filter(t => !t.completed).length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
      )}

      {/* Tasks List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>
              {showCompleted ? 'No tasks in this group' : 'All done in this group!'}
            </Text>
          </View>
        }
        ListFooterComponent={
          completedCount > 0 ? (
            <TouchableOpacity
              onPress={() => setShowCompleted(!showCompleted)}
              style={styles.showCompletedButton}
            >
              <Text style={styles.showCompletedText}>
                {showCompleted
                  ? 'Hide completed tasks'
                  : `Show ${completedCount} completed`}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Add Task Button */}
      <TouchableOpacity
        style={[styles.fab, group && { backgroundColor: group.color }]}
        onPress={() =>
          navigation.navigate('Tasks', {
            screen: 'AddTask',
            params: { defaultGroupId: groupId },
          })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colorBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  taskCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  showCompletedButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  showCompletedText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
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
  headerButton: {
    marginRight: spacing.md,
  },
  headerButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  editContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  editTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    marginTop: spacing.xl,
  },
});
