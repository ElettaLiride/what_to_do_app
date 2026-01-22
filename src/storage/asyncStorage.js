import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TASKS: '@todo_tasks',
  GROUPS: '@todo_groups',
  SETTINGS: '@todo_settings',
};

// Tasks
export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

export const loadTasks = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

// Groups
export const saveGroups = async (groups) => {
  try {
    await AsyncStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving groups:', error);
  }
};

export const loadGroups = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.GROUPS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading groups:', error);
    return [];
  }
};

// Settings
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { suggestionGroupFilter: null };
  } catch (error) {
    console.error('Error loading settings:', error);
    return { suggestionGroupFilter: null };
  }
};

// Load all data at once
export const loadAllData = async () => {
  try {
    const [tasks, groups, settings] = await Promise.all([
      loadTasks(),
      loadGroups(),
      loadSettings(),
    ]);
    return { tasks, groups, settings };
  } catch (error) {
    console.error('Error loading all data:', error);
    return { tasks: [], groups: [], settings: { suggestionGroupFilter: null } };
  }
};
