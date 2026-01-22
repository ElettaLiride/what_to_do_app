/**
 * Task Suggestion Algorithm
 *
 * Priority order:
 * 1. Tasks with due dates come first, sorted by earliest date
 * 2. Within same due date (or no due date), sort by priority (5 = highest first)
 * 3. Only incomplete tasks are considered
 */

export const getSuggestedTasks = (tasks, groups, filterGroupIds = null) => {
  // Filter out completed tasks
  let availableTasks = tasks.filter(task => !task.completed);

  // Apply group filter if set
  if (filterGroupIds !== null && Array.isArray(filterGroupIds)) {
    availableTasks = availableTasks.filter(task => {
      if (task.groupId === null) {
        // Ungrouped tasks
        return filterGroupIds.includes('ungrouped');
      }
      return filterGroupIds.includes(task.groupId);
    });
  }

  // Sort tasks
  const sortedTasks = availableTasks.sort((a, b) => {
    // Both have due dates - sort by date (earliest first)
    if (a.dueDate && b.dueDate) {
      const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateCompare !== 0) return dateCompare;
      // Same date, sort by priority (highest first)
      return b.priority - a.priority;
    }

    // Only a has due date - a comes first
    if (a.dueDate && !b.dueDate) return -1;

    // Only b has due date - b comes first
    if (!a.dueDate && b.dueDate) return 1;

    // Neither has due date - sort by priority (highest first)
    return b.priority - a.priority;
  });

  return sortedTasks;
};

/**
 * Get the next suggested task, skipping already seen ones
 */
export const getNextSuggestion = (tasks, groups, filterGroupIds, skippedIds = []) => {
  const sortedTasks = getSuggestedTasks(tasks, groups, filterGroupIds);

  // Find first task not in skipped list
  const suggestion = sortedTasks.find(task => !skippedIds.includes(task.id));

  return suggestion || null;
};

/**
 * Generate a unique ID for tasks/groups
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
