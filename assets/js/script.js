// Initialize tasks from localStorage or set to an empty array if not found
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
// Initialize nextId from localStorage or set to 1 if not found
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to save tasks and nextId to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Document ready function to initialize event listeners and render tasks
$(document).ready(function () {
  // Render the task list when the page loads
  renderTaskList();

  // Add event listener for task form submission
  $("#taskForm").on("submit", handleAddTask);

  // Add event listener for task deletion
  $(document).on("click", ".delete-task", handleDeleteTask);

  // Make the swim lanes droppable and handle task drop events
  $(".lane").droppable({
    accept: ".task-card",  // Only accept elements with the class "task-card"
    drop: handleDrop       // Call handleDrop when a task is dropped into a lane
  });

  // Initialize the date picker for the deadline field in the task form
  $("#taskDeadline").datepicker({
    dateFormat: "yy-mm-dd" // Set the date format for the date picker
  });
});

// Function to render the task list on the board
function renderTaskList() {
  // Clear existing task cards from each lane
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  // Iterate over each task in the taskList array
  taskList.forEach(task => {
    // Create a task card for each task
    const card = createTaskCard(task);
    // Append the task card to the appropriate lane based on its status
    $(`#${task.status}-cards`).append(card);
  });

  // Make each task card draggable
  $(".task-card").draggable({
    revert: "invalid",  // Revert the task card to its original position if not dropped in a valid lane
    helper: "clone",    // Clone the task card for dragging
    start: function () {
      $(this).hide();   // Hide the original task card when dragging starts
    },
    stop: function () {
      $(this).show();   // Show the original task card when dragging stops
    }
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();  // Prevent the default form submission

  // Get values from the form fields
  const title = $("#taskTitle").val().trim();
  const description = $("#taskDescription").val().trim();
  const deadline = $("#taskDeadline").val().trim();

  // Check if all required fields are filled
  if (title && description && deadline) {
    // Create a new task object
    const task = {
      id: generateTaskId(), // Generate a unique id for the task
      title,
      description,
      deadline,
      status: 'todo',  // Set the initial status to 'todo'
      color: dayjs().isAfter(dayjs(deadline)) ? 'bg-danger' : (dayjs(deadline).diff(dayjs(), 'day') <= 3 ? 'bg-warning' : '')
    };

    // Add the new task to the taskList array
    taskList.push(task);
    // Save the updated task list to localStorage
    saveTasks();
    // Re-render the task list to include the new task
    renderTaskList();
    // Reset the form fields
    $("#taskForm")[0].reset();
    // Hide the modal dialog
    $("#formModal").modal('hide');
  }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  // Find the closest task card element to the delete button clicked
  const card = $(event.target).closest('.task-card');
  // Get the id of the task from the data-id attribute
  const id = parseInt(card.data('id'));

  // Remove the task with the matching id from the taskList array
  taskList = taskList.filter(task => task.id !== id);
  // Save the updated task list to localStorage
  saveTasks();
  // Re-render the task list to reflect the deletion
  renderTaskList();
}

// Function to handle dropping a task into a different swim lane
function handleDrop(event, ui) {
  // Get the task card being dragged
  const card = ui.helper;
  // Get the id of the task from the data-id attribute
  const id = parseInt(card.data('id'));
  // Get the new status from the id of the drop target lane
  const newStatus = $(this).attr('id').replace('-cards', '');

  // Find the task in the taskList array
  const task = taskList.find(task => task.id === id);
  // Update the task's status to the new status
  task.status = newStatus;

  // Save the updated task list to localStorage
  saveTasks();
  // Re-render the task list to reflect the status change
  renderTaskList();
}

// Function to create a task card element
function createTaskCard(task) {
  // Create a card element with the task details
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

  // Return the created card element
  return card;
}
