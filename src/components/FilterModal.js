import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme/theme';
import Button from './Button';

export default function FilterModal({
  visible,
  onClose,
  groups,
  selectedGroupIds,
  onToggleGroup,
  onSelectAll,
  onClearAll,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, shadows.lg]}>
              <Text style={styles.title}>Filter Groups</Text>
              <Text style={styles.subtitle}>
                Select which groups to include in suggestions
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={onSelectAll}>
                  <Text style={styles.actionText}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClearAll}>
                  <Text style={styles.actionText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.list}>
                {/* All tasks option */}
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => onToggleGroup(null)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedGroupIds === null && styles.checkboxSelected,
                    ]}
                  >
                    {selectedGroupIds === null && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={[styles.colorDot, { backgroundColor: colors.textMuted }]} />
                  <Text style={styles.itemText}>All Groups</Text>
                </TouchableOpacity>

                {groups.map((group) => {
                  const isSelected =
                    selectedGroupIds === null ||
                    (Array.isArray(selectedGroupIds) && selectedGroupIds.includes(group.id));

                  return (
                    <TouchableOpacity
                      key={group.id}
                      style={styles.item}
                      onPress={() => onToggleGroup(group.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={[styles.colorDot, { backgroundColor: group.color }]} />
                      <Text style={styles.itemText}>{group.name}</Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Ungrouped tasks */}
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => onToggleGroup('ungrouped')}
                >
                  <View
                    style={[
                      styles.checkbox,
                      (selectedGroupIds === null ||
                        (Array.isArray(selectedGroupIds) &&
                          selectedGroupIds.includes('ungrouped'))) &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {(selectedGroupIds === null ||
                      (Array.isArray(selectedGroupIds) &&
                        selectedGroupIds.includes('ungrouped'))) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View style={[styles.colorDot, { backgroundColor: colors.border }]} />
                  <Text style={styles.itemText}>Ungrouped</Text>
                </TouchableOpacity>
              </ScrollView>

              <Button title="Done" onPress={onClose} style={styles.doneButton} />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  itemText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  doneButton: {
    marginTop: spacing.lg,
  },
});
