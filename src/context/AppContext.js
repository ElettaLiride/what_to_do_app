import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { loadAllData, saveTasks, saveGroups, saveSettings } from '../storage/asyncStorage';
import { generateId } from '../utils/taskSuggestion';
import { validateImportData, buildExportData } from '../utils/dataExport';
import { SyncManager } from '../sync/syncManager';

const AppContext = createContext();

const initialState = {
  tasks: [],
  groups: [],
  settings: {
    suggestionGroupFilter: null, // null = all groups
    currentTaskId: null, // The task currently being worked on
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        tasks: action.payload.tasks,
        groups: action.payload.groups,
        settings: action.payload.settings,
      };

    // Task actions
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        // Clear current task if it was deleted
        settings: state.settings.currentTaskId === action.payload
          ? { ...state.settings, currentTaskId: null }
          : state.settings,
      };

    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? {
                ...task,
                completed: true,
                completedAt: new Date().toISOString(),
                previousGroupId: task.groupId, // Store original group for undo
              }
            : task
        ),
        // Clear current task if it was completed
        settings: state.settings.currentTaskId === action.payload
          ? { ...state.settings, currentTaskId: null }
          : state.settings,
      };

    case 'UNCOMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? {
                ...task,
                completed: false,
                completedAt: null,
              }
            : task
        ),
      };

    // Subtask actions
    case 'ADD_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: [...(task.subtasks || []), action.payload.subtask],
              }
            : task
        ),
      };

    case 'UPDATE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: (task.subtasks || []).map(st =>
                  st.id === action.payload.subtaskId
                    ? { ...st, ...action.payload.updates }
                    : st
                ),
              }
            : task
        ),
      };

    case 'DELETE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: (task.subtasks || []).filter(st => st.id !== action.payload.subtaskId),
              }
            : task
        ),
      };

    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: (task.subtasks || []).map(st =>
                  st.id === action.payload.subtaskId
                    ? { ...st, completed: !st.completed }
                    : st
                ),
              }
            : task
        ),
      };

    // Group actions
    case 'ADD_GROUP':
      return {
        ...state,
        groups: [...state.groups, action.payload],
      };

    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.id ? { ...group, ...action.payload } : group
        ),
      };

    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload),
        // Also remove group from tasks
        tasks: state.tasks.map(task =>
          task.groupId === action.payload ? { ...task, groupId: null } : task
        ),
      };

    // Settings actions
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_CURRENT_TASK':
      // If setting a new current task (not clearing), record the work date
      if (action.payload) {
        return {
          ...state,
          settings: { ...state.settings, currentTaskId: action.payload },
          tasks: state.tasks.map(task =>
            task.id === action.payload
              ? {
                  ...task,
                  workedOnDates: [...(task.workedOnDates || []), new Date().toISOString()],
                }
              : task
          ),
        };
      }
      return {
        ...state,
        settings: { ...state.settings, currentTaskId: action.payload },
      };

    case 'MERGE_DATA':
      return {
        ...state,
        tasks: action.payload.tasks,
        groups: action.payload.groups,
        settings: { ...state.settings, ...action.payload.settings },
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('disconnected'); // 'connected' | 'disconnected' | 'error'

  // Ref to always have the latest state (avoids stale closures in SyncManager)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const syncManagerRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await loadAllData();
      dispatch({ type: 'LOAD_DATA', payload: data });
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Start SyncManager after initial load
  useEffect(() => {
    if (!isLoading && (Platform.OS === 'android' || Platform.OS === 'web')) {
      const sm = new SyncManager(
        () => stateRef.current,
        (mergedData) => dispatch({ type: 'MERGE_DATA', payload: mergedData }),
        setSyncStatus,
      );
      sm.start();
      syncManagerRef.current = sm;

      return () => sm.stop();
    }
  }, [isLoading]);

  // Save tasks when they change
  useEffect(() => {
    if (!isLoading) {
      saveTasks(state.tasks);
    }
  }, [state.tasks, isLoading]);

  // Save groups when they change
  useEffect(() => {
    if (!isLoading) {
      saveGroups(state.groups);
    }
  }, [state.groups, isLoading]);

  // Save settings when they change
  useEffect(() => {
    if (!isLoading) {
      saveSettings(state.settings);
    }
  }, [state.settings, isLoading]);

  // Trigger sync write on state changes (debounced inside SyncManager)
  useEffect(() => {
    if (!isLoading && syncManagerRef.current) {
      syncManagerRef.current.writeCurrentState();
    }
  }, [state.tasks, state.groups, state.settings, isLoading]);

  // Action creators
  const actions = {
    // Tasks
    addTask: (taskData) => {
      const task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description || null,
        groupId: taskData.groupId || null,
        subtasks: taskData.subtasks || [],
        subtasksToShow: taskData.subtasksToShow || 2, // Default: show 2 subtasks on home
        dueDate: taskData.dueDate || null,
        priority: taskData.priority !== undefined ? taskData.priority : 3,
        completed: false,
        completedAt: null,
        previousGroupId: null,
        workedOnDates: [], // Track when this task was worked on
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TASK', payload: task });
      return task;
    },

    updateTask: (id, updates) => {
      dispatch({ type: 'UPDATE_TASK', payload: { id, ...updates } });
    },

    deleteTask: (id) => {
      dispatch({ type: 'DELETE_TASK', payload: id });
    },

    completeTask: (id) => {
      dispatch({ type: 'COMPLETE_TASK', payload: id });
    },

    uncompleteTask: (id) => {
      dispatch({ type: 'UNCOMPLETE_TASK', payload: id });
    },

    setCurrentTask: (id) => {
      dispatch({ type: 'SET_CURRENT_TASK', payload: id });
    },

    clearCurrentTask: () => {
      dispatch({ type: 'SET_CURRENT_TASK', payload: null });
    },

    // Subtasks
    addSubtask: (taskId, title) => {
      const subtask = {
        id: generateId(),
        title,
        completed: false,
      };
      dispatch({ type: 'ADD_SUBTASK', payload: { taskId, subtask } });
      return subtask;
    },

    updateSubtask: (taskId, subtaskId, updates) => {
      dispatch({ type: 'UPDATE_SUBTASK', payload: { taskId, subtaskId, updates } });
    },

    deleteSubtask: (taskId, subtaskId) => {
      dispatch({ type: 'DELETE_SUBTASK', payload: { taskId, subtaskId } });
    },

    toggleSubtask: (taskId, subtaskId) => {
      dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId, subtaskId } });
    },

    // Groups
    addGroup: (groupData) => {
      const group = {
        id: generateId(),
        name: groupData.name,
        color: groupData.color || '#7CB69D',
      };
      dispatch({ type: 'ADD_GROUP', payload: group });
      return group;
    },

    updateGroup: (id, updates) => {
      dispatch({ type: 'UPDATE_GROUP', payload: { id, ...updates } });
    },

    deleteGroup: (id) => {
      dispatch({ type: 'DELETE_GROUP', payload: id });
    },

    // Settings
    updateSettings: (updates) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
    },

    // Data management
    importData: (data) => {
      const validation = validateImportData(data);
      if (!validation.valid) throw new Error(validation.error);
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          tasks: data.tasks,
          groups: data.groups,
          settings: { ...initialState.settings, ...data.settings },
        },
      });
    },

    getExportData: () => buildExportData(state.tasks, state.groups, state.settings),

    // Helper functions
    getTaskById: (id) => state.tasks.find(task => task.id === id),
    getGroupById: (id) => state.groups.find(group => group.id === id),
    getTasksByGroup: (groupId) =>
      state.tasks.filter(task =>
        groupId === null ? task.groupId === null : task.groupId === groupId
      ),
    getTaskCount: (groupId) =>
      state.tasks.filter(task => task.groupId === groupId && !task.completed).length,
    getCurrentTask: () => {
      if (!state.settings.currentTaskId) return null;
      return state.tasks.find(task => task.id === state.settings.currentTaskId);
    },
    getActiveTasks: () => state.tasks.filter(task => !task.completed),
    getArchivedTasks: () => state.tasks.filter(task => task.completed),
    getIncompleteSubtasks: (taskId, limit) => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || !task.subtasks) return [];
      const incomplete = task.subtasks.filter(st => !st.completed);
      return limit ? incomplete.slice(0, limit) : incomplete;
    },
  };

  return (
    <AppContext.Provider value={{ state, actions, isLoading, syncStatus }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
