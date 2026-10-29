const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');
const dueInput = document.getElementById('due-input');
const searchInput = document.getElementById('search-input');
const sortInput = document.getElementById('sort-input');
const filterButtons = document.querySelectorAll('.filter');
const clearDoneButton = document.getElementById('clear-done');
const list = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const summary = document.getElementById('summary');
const progressBar = document.getElementById('progress-bar');

let tasks = loadTasks();
let currentFilter = 'all';

function updateTask(id, changes) {
  tasks = tasks.map(task => (task.id === id ? { ...task, ...changes } : task));
  saveTasks(tasks);
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks(tasks);
  render();
}

function startEditing(task, textEl) {
  const editor = document.createElement('input');
  editor.type = 'text';
  editor.value = task.text;
  editor.className = 'edit-input';

  const finish = (commit) => {
    const value = editor.value.trim();
    if (commit && value) updateTask(task.id, { text: value });
    else render();
  };

  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  editor.addEventListener('blur', () => finish(true));

  textEl.replaceWith(editor);
  editor.focus();
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task priority-${task.priority}`;
  if (task.done) li.classList.add('done');
  if (isOverdue(task)) li.classList.add('overdue');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;
  checkbox.addEventListener('change', () => updateTask(task.id, { done: checkbox.checked }));

  const body = document.createElement('div');
  body.className = 'task-body';

  const text = document.createElement('span');
  text.className = 'task-text';
  text.textContent = task.text;
  text.title = 'Double-click to edit';
  text.addEventListener('dblclick', () => startEditing(task, text));

  const meta = document.createElement('small');
  meta.className = 'task-meta';
  const due = task.due ? ` · Due ${formatDate(task.due)}` : '';
  meta.textContent = `${task.priority} priority${due}`;

  body.append(text, meta);

  const del = document.createElement('button');
  del.textContent = 'Delete';
  del.className = 'delete';
  del.type = 'button';
  del.addEventListener('click', () => deleteTask(task.id));

  li.append(checkbox, body, del);
  return li;
}

function render() {
  const visible = sortTasks(filterTasks(tasks, currentFilter, searchInput.value), sortInput.value);

  list.innerHTML = '';
  visible.forEach(task => list.appendChild(createTaskElement(task)));
  emptyState.hidden = visible.length > 0;

  const stats = getStats(tasks);
  const overdueText = stats.overdue ? ` · ${stats.overdue} overdue` : '';
  summary.textContent = `${stats.done} of ${stats.total} tasks completed${overdueText}`;
  progressBar.style.width = `${stats.percent}%`;
  clearDoneButton.disabled = stats.done === 0;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.push({
    id: generateId(),
    text,
    done: false,
    priority: priorityInput.value,
    due: dueInput.value || null,
    createdAt: Date.now(),
  });

  input.value = '';
  dueInput.value = '';
  priorityInput.value = 'medium';
  saveTasks(tasks);
  render();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', render);
sortInput.addEventListener('change', render);

clearDoneButton.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks(tasks);
  render();
});

render();
