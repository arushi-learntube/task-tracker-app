const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const summary = document.getElementById('summary');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function render() {
  list.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      tasks[index].done = checkbox.checked;
      save();
      render();
    });

    const text = document.createElement('span');
    text.textContent = task.text;

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'delete';
    del.addEventListener('click', () => {
      tasks.splice(index, 1);
      save();
      render();
    });

    li.append(checkbox, text, del);
    list.appendChild(li);
  });

  const done = tasks.filter(t => t.done).length;
  summary.textContent = `${done} of ${tasks.length} tasks completed`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ text, done: false });
  input.value = '';
  save();
  render();
});

render();
