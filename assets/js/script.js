// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Create a task card
function createTaskCard(task) {
  const card = $(`
    <div class="card mb-3 task-card" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);

  // Color code based on deadline
  const now = dayjs();
  const deadline = dayjs(task.deadline);
  if (deadline.isBefore(now)) {
    card.find('.card-body').addClass('bg-danger text-white');
  } else if (deadline.isBefore(now.add(2, 'day'))) {
    card.find('.card-body').addClass('bg-warning');
  }

  return card;
}

// Render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  $('.task-card').draggable({
    revert: 'invalid',
    stack: '.task-card',
    cursor: 'move'
  });

  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#taskTitle').val().trim();
  const description = $('#taskDescription').val().trim();
  const deadline = $('#taskDeadline').val().trim();

  if (!title || !description || !deadline) {
    return;
  }

  const task = {
    id: generateTaskId(),
    title,
    description,
    deadline,
    status: 'todo'
  };

  taskList.push(task);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  localStorage.setItem('nextId', JSON.stringify(nextId));

  renderTaskList();
  $('#formModal').modal('hide');
  $('#taskForm')[0].reset();
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('id');
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('id');
  const newStatus = $(this).attr('id').split('-')[0];
  taskList = taskList.map(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
    return task;
  });
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $('#taskForm').on('submit', handleAddTask);
  $(document).on('click', '.delete-task', handleDeleteTask);

  $('#taskDeadline').datepicker({ dateFormat: 'yy-mm-dd' });
});
