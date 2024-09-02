$(document).ready(function () {
  // Render the task list, add event listeners, and make lanes droppable
  renderTaskList();

  // Handle task form submission
  $("#taskForm").on("submit", handleAddTask);

  // Handle task deletion
  $(document).on("click", ".delete-task", handleDeleteTask);

  // Make lanes droppable and handle drop events
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Make the date field a date picker
  $("#taskDeadline").datepicker({
    dateFormat: "yy-mm-dd"
  });
});

function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone",
    start: function () {
      $(this).hide();
    },
    stop: function () {
      $(this).show();
    }
  });
}

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
      color: dayjs().isAfter(dayjs(deadline)) ? 'bg-danger' : (dayjs(deadline).diff(dayjs(), 'day') <= 3 ? 'bg-warning' : '')
    };

    taskList.push(task);
    saveTasks();
    renderTaskList();
    $("#taskForm")[0].reset();
    $("#formModal").modal('hide');
  }
}

function handleDeleteTask(event) {
  const card = $(event.target).closest('.task-card');
  const id = parseInt(card.data('id'));

  taskList = taskList.filter(task => task.id !== id);
  saveTasks();
  renderTaskList();
}

function handleDrop(event, ui) {
  const card = ui.helper;
  const id = parseInt(card.data('id'));
  const newStatus = $(this).attr('id').replace('-cards', '');

  const task = taskList.find(task => task.id === id);
  task.status = newStatus;

  saveTasks();
  renderTaskList();
}
