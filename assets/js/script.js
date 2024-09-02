// Initialize tasks and nextId
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Create a task card
function createTaskCard(task) {
  const card = $(`
    <div class="card task-card mb-3" data-id="${task.id}">
      <div class="card-body ${task.color}">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small>Deadline: ${task.deadline}</small></p>
        <button class="btn btn-danger delete-task">Delete</button>
      </div>
    </div>
  `);

  card.draggable({
    helper: "clone",
    start: function () {
      $(this).hide();
    },
    stop: function () {
      $(this).show();
    }
  });

  return card;
}

// Render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#taskTitle").val().trim();
  const description = $("#taskDescription").val().trim();
  const deadline = $("#taskDeadline").val().trim();

  if (title && description && deadline) {
    const task = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      status: 'todo',
      color: dayjs().isAfter(dayjs(deadline)) ? 'bg-danger' : (dayjs().isBefore(dayjs(deadline).add(3, 'day')) ? 'bg-warning' : '')
    };

    taskList.push(task);
    saveTasks();
    renderTaskList();
    $("#taskForm")[0].reset();
    $("#formModal").modal('hide');
  }
}

// Handle deleting a task
function handleDeleteTask(event) {
  const card = $(event.target).closest('.task-card');
  const id = parseInt(card.data('id'));

  taskList = taskList.filter(task => task.id !== id);
  saveTasks();
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const card = ui.helper;
  const id = parseInt(card.data('id'));
  const newStatus = $(this).attr('id').replace('-cards', '');

  const task = taskList.find(task => task.id === id);
  task.status = newStatus;

  saveTasks();
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#taskForm").on("submit", handleAddTask);
  $(document).on("click", ".delete-task", handleDeleteTask);

  $(".lane").droppable({
   
  }
)})