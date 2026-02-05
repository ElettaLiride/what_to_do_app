import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme/theme';
import Button from './Button';
import {
  buildExportData,
  validateImportData,
  downloadJsonWeb,
  readJsonFileWeb,
} from '../utils/dataExport';

const isWeb = Platform.OS === 'web';

const isAndroid = Platform.OS === 'android';

export default function DataManagementModal({ visible, onClose, state, actions, syncStatus }) {
  const fileInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Check permission on open (Android only)
  React.useEffect(() => {
    if (visible && isAndroid && !permissionChecked) {
      (async () => {
        try {
          const { checkStoragePermission } = await import('../utils/permissions');
          const granted = await checkStoragePermission();
          setHasPermission(granted);
          setPermissionChecked(true);
        } catch {
          setHasPermission(false);
          setPermissionChecked(true);
        }
      })();
    }
  }, [visible, permissionChecked]);

  const handleRequestPermission = async () => {
    try {
      const { requestStoragePermission } = await import('../utils/permissions');
      await requestStoragePermission();
      // Re-check after returning from settings
      setPermissionChecked(false);
    } catch (error) {
      setStatusMessage('Failed to open settings: ' + error.message);
    }
  };

  const handleExport = () => {
    try {
      const data = buildExportData(state.tasks, state.groups, state.settings);
      if (isWeb) {
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadJsonWeb(data, `todo-backup-${timestamp}.json`);
        setStatusMessage('Backup downloaded!');
      }
      // Android export will be added in a later phase
    } catch (error) {
      setStatusMessage('Export failed: ' + error.message);
    }
  };

  const handleImportClick = () => {
    if (isWeb && fileInputRef.current) {
      fileInputRef.current.click();
    }
    // Android import via expo-document-picker will be added later
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readJsonFileWeb(file);
      const validation = validateImportData(data);
      if (!validation.valid) {
        setStatusMessage('Invalid file: ' + validation.error);
        return;
      }

      const taskCount = data.tasks.length;
      const groupCount = data.groups.length;

      if (isWeb) {
        // On web, use window.confirm since Alert.alert doesn't work
        const confirmed = window.confirm(
          `Import ${taskCount} tasks and ${groupCount} groups?\n\nThis will replace all current data.`
        );
        if (confirmed) {
          actions.importData(data);
          setStatusMessage(`Imported ${taskCount} tasks and ${groupCount} groups!`);
        }
      } else {
        Alert.alert(
          'Import Data',
          `Import ${taskCount} tasks and ${groupCount} groups?\n\nThis will replace all current data.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Import',
              style: 'destructive',
              onPress: () => {
                actions.importData(data);
                setStatusMessage(`Imported ${taskCount} tasks and ${groupCount} groups!`);
              },
            },
          ]
        );
      }
    } catch (error) {
      setStatusMessage('Import failed: ' + error.message);
    }

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setStatusMessage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, shadows.lg]}>
              <Text style={styles.title}>Data Management</Text>
              <Text style={styles.subtitle}>
                Export or import your tasks and groups
              </Text>

              <View style={styles.buttonGroup}>
                <Button
                  title="Export Backup"
                  onPress={handleExport}
                  variant="primary"
                  style={styles.actionButton}
                />
                <Button
                  title="Import Backup"
                  onPress={handleImportClick}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>

              {/* Sync Status */}
              {(isWeb || isAndroid) && (
                <View style={styles.syncSection}>
                  <View style={styles.syncRow}>
                    <View style={[
                      styles.syncDot,
                      { backgroundColor: syncStatus === 'connected' ? colors.success : syncStatus === 'error' ? colors.danger : colors.textMuted },
                    ]} />
                    <Text style={styles.syncText}>
                      Sync: {syncStatus === 'connected' ? 'Connected' : syncStatus === 'error' ? 'Error' : 'Disconnected'}
                    </Text>
                  </View>
                  {isWeb && syncStatus === 'disconnected' && (
                    <Text style={styles.syncHint}>
                      Start the sync server: npm run sync-server
                    </Text>
                  )}
                  {isAndroid && permissionChecked && !hasPermission && (
                    <Button
                      title="Grant File Access"
                      onPress={handleRequestPermission}
                      variant="secondary"
                      size="sm"
                      style={styles.permissionButton}
                    />
                  )}
                </View>
              )}

              {statusMessage && (
                <Text style={styles.statusMessage}>{statusMessage}</Text>
              )}

              {/* Hidden file input for web import */}
              {isWeb && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelected}
                  style={{ display: 'none' }}
                />
              )}

              <Button
                title="Close"
                onPress={handleClose}
                variant="ghost"
                style={styles.closeButton}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
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
    marginBottom: spacing.lg,
  },
  buttonGroup: {
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  statusMessage: {
    fontSize: fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  closeButton: {
    marginTop: spacing.md,
  },
  syncSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  syncText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  syncHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  permissionButton: {
    marginTop: spacing.sm,
  },
});