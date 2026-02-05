/**
 * Merge Engine — Conflict resolution for Syncthing-based sync.
 *
 * Identity keys:
 *   - Tasks matched by TITLE (case-insensitive)
 *   - Subtasks matched by TITLE (case-insensitive) within their parent task
 *   - Groups matched by NAME (case-insensitive)
 *
 * Merge modes:
 *   - 'sync': normal polling (file changed externally). Local-only items are KEPT
 *     (they are new items not yet seen by the other device).
 *   - 'conflict': merging a .sync-conflict-* file. Both datasets share a common
 *     ancestor, so missing items mean deletion — deletion wins.
 */

/**
 * Merge two complete data sets.
 * @param {Object} local  - { tasks, groups, settings }
 * @param {Object} incoming - { tasks, groups, settings }
 * @param {'sync'|'conflict'} mode
 * @returns {Object} merged { tasks, groups, settings }
 */
export function mergeData(local, incoming, mode = 'sync') {
  const mergedGroups = mergeGroups(local.groups || [], incoming.groups || [], mode);
  const mergedTasks = mergeTasks(local.tasks || [], incoming.tasks || [], mode);
  const mergedSettings = mergeSettings(local.settings || {}, incoming.settings || {});
  return { tasks: mergedTasks, groups: mergedGroups, settings: mergedSettings };
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

function mergeGroups(localGroups, incomingGroups, mode) {
  const localByName = new Map();
  for (const g of localGroups) {
    localByName.set(g.name.toLowerCase(), g);
  }

  const incomingByName = new Map();
  for (const g of incomingGroups) {
    incomingByName.set(g.name.toLowerCase(), g);
  }

  const allNames = new Set([...localByName.keys(), ...incomingByName.keys()]);
  const merged = [];

  for (const nameKey of allNames) {
    const localGroup = localByName.get(nameKey);
    const incomingGroup = incomingByName.get(nameKey);

    if (localGroup && !incomingGroup) {
      // Group only exists locally
      if (mode === 'conflict') {
        // Deletion wins in conflict mode — skip it
        continue;
      }
      // In sync mode, keep local (new group not yet synced)
      merged.push(localGroup);
      continue;
    }

    if (!localGroup && incomingGroup) {
      // Group only in incoming — new or kept by other device
      merged.push(incomingGroup);
      continue;
    }

    // Both exist — incoming configuration wins
    merged.push({ ...incomingGroup });
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

function mergeTasks(localTasks, incomingTasks, mode) {
  const localByTitle = new Map();
  for (const t of localTasks) {
    localByTitle.set(t.title.toLowerCase(), t);
  }

  const incomingByTitle = new Map();
  for (const t of incomingTasks) {
    incomingByTitle.set(t.title.toLowerCase(), t);
  }

  const allTitles = new Set([...localByTitle.keys(), ...incomingByTitle.keys()]);
  const merged = [];

  for (const titleKey of allTitles) {
    const localTask = localByTitle.get(titleKey);
    const incomingTask = incomingByTitle.get(titleKey);

    if (localTask && !incomingTask) {
      if (mode === 'conflict') {
        // Deletion wins — task was deleted on the other device
        continue;
      }
      // Sync mode: keep local task (new task not yet on other device)
      merged.push(localTask);
      continue;
    }

    if (!localTask && incomingTask) {
      // New task from the other device — keep it
      merged.push(incomingTask);
      continue;
    }

    // Both exist — merge fields
    merged.push(mergeOneTask(localTask, incomingTask));
  }

  return merged;
}

function mergeOneTask(local, incoming) {
  // "Deleted or marked as done wins"
  const completed = local.completed || incoming.completed;
  const completedAt = completed
    ? (local.completedAt || incoming.completedAt)
    : null;

  // "Different priority: highest wins"
  const priority = Math.max(local.priority || 3, incoming.priority || 3);

  // "Due date: latest wins; if only one has it, use that"
  let dueDate;
  if (local.dueDate && incoming.dueDate) {
    dueDate = new Date(local.dueDate) > new Date(incoming.dueDate)
      ? local.dueDate
      : incoming.dueDate;
  } else {
    dueDate = local.dueDate || incoming.dueDate;
  }

  // "workedOnDates: union of both, deduplicated"
  const workedOnDates = [...new Set([
    ...(local.workedOnDates || []),
    ...(incoming.workedOnDates || []),
  ])].sort();

  // "Group changed: incoming wins"
  const groupId = incoming.groupId !== undefined ? incoming.groupId : local.groupId;

  // "Description changed: incoming wins"
  const description = incoming.description !== undefined
    ? incoming.description
    : local.description;

  // Merge subtasks
  const subtasks = mergeSubtasks(
    local.subtasks || [],
    incoming.subtasks || [],
  );

  return {
    // Keep local id and createdAt (stable on this device)
    ...local,
    // Merged fields
    title: incoming.title || local.title,
    description,
    groupId,
    priority,
    dueDate,
    completed,
    completedAt,
    workedOnDates,
    subtasks,
    subtasksToShow: incoming.subtasksToShow || local.subtasksToShow,
    previousGroupId: incoming.previousGroupId !== undefined
      ? incoming.previousGroupId
      : local.previousGroupId,
  };
}

// ---------------------------------------------------------------------------
// Subtasks
// ---------------------------------------------------------------------------

function mergeSubtasks(localSubs, incomingSubs) {
  const localByTitle = new Map();
  for (const s of localSubs) {
    localByTitle.set(s.title.toLowerCase(), s);
  }

  const incomingByTitle = new Map();
  for (const s of incomingSubs) {
    incomingByTitle.set(s.title.toLowerCase(), s);
  }

  const allTitles = new Set([...localByTitle.keys(), ...incomingByTitle.keys()]);
  const merged = [];

  for (const titleKey of allTitles) {
    const localSub = localByTitle.get(titleKey);
    const incomingSub = incomingByTitle.get(titleKey);

    if (localSub && !incomingSub) {
      // "Deleted subtask wins" — removed on the other side
      continue;
    }

    if (!localSub && incomingSub) {
      // "Created subtask wins" — new on the other side
      merged.push(incomingSub);
      continue;
    }

    // Both exist: "Checked subtask wins"
    merged.push({
      ...localSub,
      completed: localSub.completed || incomingSub.completed,
      title: incomingSub.title || localSub.title,
    });
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

function mergeSettings(local, incoming) {
  return {
    ...local,
    // "Keep incoming working task"
    currentTaskId: incoming.currentTaskId != null
      ? incoming.currentTaskId
      : local.currentTaskId,
    // Keep local UI preference
    suggestionGroupFilter: local.suggestionGroupFilter,
  };
}