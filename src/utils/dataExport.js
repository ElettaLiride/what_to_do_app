import { Platform } from 'react-native';

/**
 * Builds a complete export object from the app state.
 */
export function buildExportData(tasks, groups, settings) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    groups,
    settings,
  };
}

/**
 * Validates that imported JSON has the expected structure.
 */
export function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Not a valid JSON object' };
  }
  if (!Array.isArray(data.tasks)) {
    return { valid: false, error: 'Missing or invalid tasks array' };
  }
  if (!Array.isArray(data.groups)) {
    return { valid: false, error: 'Missing or invalid groups array' };
  }
  if (!data.settings || typeof data.settings !== 'object') {
    return { valid: false, error: 'Missing or invalid settings' };
  }
  return { valid: true };
}

/**
 * Web only: triggers a file download of the JSON data.
 */
export function downloadJsonWeb(data, filename = 'todo-backup.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Web only: reads a JSON file from a File object (from <input type="file">).
 * Returns a promise that resolves to the parsed JSON.
 */
export function readJsonFileWeb(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}