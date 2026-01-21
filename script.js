// ===== Selección de elementos =====
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const filterBtns = document.querySelectorAll('.filter-btn');
const darkModeBtn = document.getElementById('darkModeBtn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ===== Cargar tareas =====
tasks.forEach(task => renderTask(task.text, task.completed));
updateCounter();
applyFilter();

// ===== Agregar tarea =====
addTaskBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  if(taskText !== '') {
    const task = { text: taskText, completed: false };
    tasks.push(task);
    saveTasks();
    renderTask(task.text, task.completed, true);
    taskInput.value = '';
    taskInput.focus();
    updateCounter();
    applyFilter();
  }
});

// Agregar con Enter
taskInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') addTaskBtn.click();
});

// ===== Renderizar tarea =====
function renderTask(text, completed, added = false) {
  const li = document.createElement('li');
  li.draggable = true;
  if(completed) li.classList.add('completed');
  if(added) li.classList.add('added');

  // Texto
  const span = document.createElement('span');
  span.textContent = text;

  // Botones
  const buttonsDiv = document.createElement('div');
  buttonsDiv.classList.add('task-buttons');

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Editar';
  editBtn.classList.add('edit-btn');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const newText = prompt('Editar tarea:', text);
    if(newText && newText.trim() !== '') {
      updateTask(text, li.classList.contains('completed'), newText.trim());
      span.textContent = newText.trim();
      text = newText.trim();
      updateCounter();
      applyFilter();
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    li.classList.add('removed');
    li.addEventListener('animationend', () => {
      deleteTask(text);
      li.remove();
      updateCounter();
    });
  });

  buttonsDiv.appendChild(editBtn);
  buttonsDiv.appendChild(deleteBtn);
  li.appendChild(span);
  li.appendChild(buttonsDiv);

  // Toggle completado
  li.addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') {
      li.classList.toggle('completed');
      updateTask(text, li.classList.contains('completed'));
      updateCounter();
      applyFilter();
    }
  });

  // Arrastrar y soltar
  li.addEventListener('dragstart', dragStart);
  li.addEventListener('dragover', dragOver);
  li.addEventListener('drop', drop);
  li.addEventListener('dragend', dragEnd);

  taskList.appendChild(li);
}

// ===== Guardar en localStorage =====
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== Actualizar tarea =====
function updateTask(oldText, completed, newText = null) {
  const task = tasks.find(t => t.text === oldText);
  if(task) {
    task.completed = completed;
    if(newText) task.text = newText;
    saveTasks();
  }
}

// ===== Eliminar tarea =====
function deleteTask(text) {
  tasks = tasks.filter(t => t.text !== text);
  saveTasks();
}

// ===== Contador =====
function updateCounter() {
  totalTasksEl.textContent = `Total: ${tasks.length}`;
  const pending = tasks.filter(t => !t.completed).length;
  pendingTasksEl.textContent = `Pendientes: ${pending}`;
}

// ===== Filtros =====
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    applyFilter();
  });
});

function applyFilter() {
  const lis = taskList.querySelectorAll('li');
  lis.forEach(li => {
    li.style.display = 'flex'; // reset
    if(currentFilter === 'pending' && li.classList.contains('completed')) {
      li.style.display = 'none';
    }
    if(currentFilter === 'completed' && !li.classList.contains('completed')) {
      li.style.display = 'none';
    }
  });
}

// ===== Modo oscuro =====
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// ===== Drag and Drop =====
let dragged;

function dragStart(e) {
  dragged = e.currentTarget;
  e.currentTarget.style.opacity = 0.5;
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  if(e.currentTarget !== dragged) {
    let nodes = Array.from(taskList.children);
    let draggedIndex = nodes.indexOf(dragged);
    let targetIndex = nodes.indexOf(e.currentTarget);

    if(draggedIndex < targetIndex) {
      taskList.insertBefore(dragged, e.currentTarget.nextSibling);
    } else {
      taskList.insertBefore(dragged, e.currentTarget);
    }

    // Actualizar orden en array y localStorage
    const newTasks = [];
    taskList.querySelectorAll('li').forEach(li => {
      const text = li.querySelector('span').textContent;
      const task = tasks.find(t => t.text === text);
      if(task) newTasks.push(task);
    });
    tasks = newTasks;
    saveTasks();
  }
}

function dragEnd(e) {
  e.currentTarget.style.opacity = 1;
}
