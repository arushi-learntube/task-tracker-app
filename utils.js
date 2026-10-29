// Helper functions used by app.js

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadTasks() {
  try {
    const raw = localStorage.getItem('tasks');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Could not load tasks', err);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (err) {
    console.warn('Could not save tasks', err);
  }
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function isOverdue(task) {
  if (!task.due || task.done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.due + 'T00:00:00') < today;
}

function filterTasks(tasks, filter, query) {
  const q = query.trim().toLowerCase();
  return tasks.filter(task => {
    if (filter === 'active' && task.done) return false;
    if (filter === 'done' && !task.done) return false;
    if (q && !task.text.toLowerCase().includes(q)) return false;
    return true;
  });
}

function sortTasks(tasks, sortBy) {
  const copy = [...tasks];
  if (sortBy === 'priority') {
    copy.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  } else if (sortBy === 'due') {
    copy.sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    });
  } else {
    copy.sort((a, b) => b.createdAt - a.createdAt);
  }
  return copy;
}

function getStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const overdue = tasks.filter(isOverdue).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, overdue, percent };
}
