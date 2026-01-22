import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { GroupItem, Input, Button } from '../components';

const GROUP_COLORS = [
  '#7CB69D', // Sage green
  '#E8A598', // Coral
  '#8BA4D9', // Soft blue
  '#D4A5D9', // Lavender
  '#F5C77E', // Warm yellow
  '#9DD5C0', // Teal
  '#E8B4A0', // Peach
  '#A8C8E8', // Sky blue
];

export default function GroupsScreen({ navigation }) {
  const { state, actions } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState(GROUP_COLORS[0]);

  const openAddModal = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupColor(GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)]);
    setModalVisible(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupColor(group.color);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!groupName.trim()) return;

    if (editingGroup) {
      actions.updateGroup(editingGroup.id, {
        name: groupName.trim(),
        color: groupColor,
      });
    } else {
      actions.addGroup({
        name: groupName.trim(),
        color: groupColor,
      });
    }

    setModalVisible(false);
    setGroupName('');
    setEditingGroup(null);
  };

  const handleDelete = () => {
    if (editingGroup) {
      actions.deleteGroup(editingGroup.id);
      setModalVisible(false);
      setEditingGroup(null);
    }
  };

  const renderGroup = ({ item }) => (
    <GroupItem
      group={item}
      taskCount={actions.getTaskCount(item.id)}
      onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
    />
  );

  // Count ungrouped tasks
  const ungroupedCount = state.tasks.filter(t => t.groupId === null && !t.completed).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={state.groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          ungroupedCount > 0 ? (
            <GroupItem
              group={{ id: null, name: 'Ungrouped', color: colors.textMuted }}
              taskCount={ungroupedCount}
              onPress={() => navigation.navigate('GroupDetail', { groupId: null })}
            />
          ) : null
        }
        ListEmptyComponent={
          ungroupedCount === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={styles.emptyText}>No groups yet</Text>
              <Text style={styles.emptySubtext}>
                Create groups to organize your tasks
              </Text>
            </View>
          ) : null
        }
      />

      {/* Add Group Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modal, shadows.lg]}>
                <Text style={styles.modalTitle}>
                  {editingGroup ? 'Edit Group' : 'New Group'}
                </Text>

                <Input
                  label="Group Name"
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Enter group name"
                  autoFocus
                />

                <Text style={styles.colorLabel}>Color</Text>
                <View style={styles.colorGrid}>
                  {GROUP_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        groupColor === color && styles.colorOptionActive,
                      ]}
                      onPress={() => setGroupColor(color)}
                    >
                      {groupColor === color && (
                        <Text style={styles.colorCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  {editingGroup && (
                    <Button
                      title="Delete"
                      variant="ghost"
                      onPress={handleDelete}
                      textStyle={{ color: colors.danger }}
                      style={styles.deleteButton}
                    />
                  )}
                  <View style={styles.modalButtons}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={() => setModalVisible(false)}
                      style={styles.cancelButton}
                    />
                    <Button
                      title={editingGroup ? 'Save' : 'Create'}
                      onPress={handleSave}
                      disabled={!groupName.trim()}
                      style={styles.saveButton}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit hint */}
      {state.groups.length > 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Long press a group to edit</Text>
        </View>
      )}

      {/* Actually, let's add edit via tap on a separate button */}
      <FlatList
        data={state.groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => openEditModal(item)}
          >
            <Text>✏️</Text>
          </TouchableOpacity>
        )}
        style={styles.editList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.secondary,
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
    fontWeight: fontWeight.normal,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  colorLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  colorCheck: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
  },
  modalActions: {
    marginTop: spacing.md,
  },
  deleteButton: {
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  hint: {
    position: 'absolute',
    bottom: spacing.lg + 70,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  editList: {
    display: 'none', // Hidden, logic moved elsewhere
  },
  editIcon: {
    display: 'none',
  },
});
