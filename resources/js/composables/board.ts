import { ref, watchEffect, onMounted } from "vue";
import axios from "axios";
import { createToaster } from "@meforma/vue-toaster";

// Toaster instance
const toaster = createToaster();

// Kanban board columns
const columns = ref([
  { id: "0", title: "To Do", tasks: [] },
  { id: "1", title: "In Progress", tasks: [] },
  { id: "2", title: "Done", tasks: [] },
]);

const newTaskTitle = ref<Record<string, string>>({});
const isAddingTask = ref<Record<string, boolean>>({});

const editingTaskId = ref<string | null>(null);
const editedTaskTitle = ref("");

const isDragging = ref(false);

// Edit Task
const editTask = (task: { id: string; description: string }) => {
  editingTaskId.value = task.id;
  editedTaskTitle.value = task.description;
};

// Update Task
const updateTask = async (columnId: string, taskId: number) => {
  if (!editedTaskTitle.value.trim()) {
    cancelEdit();
    return;
  }

  try {
    const response = await axios.put(`/tasks/${taskId}`, {
      description: editedTaskTitle.value,
    });

    const column = columns.value.find((col) => col.id === columnId);
    if (column) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) task.description = editedTaskTitle.value;
    }

    cancelEdit();
    toaster.show(response.data.message, { position: "top-right" });
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

// Cancel Editing
const cancelEdit = () => {
  editingTaskId.value = null;
  editedTaskTitle.value = "";
};

// Fetch Tasks
const fetchTasks = async () => {
  try {
    const response = await axios.get("/tasks");
    columns.value.forEach((column) => {
      column.tasks = response.data
        .filter((task: { status: string }) => task.status === column.id)
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position);
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

// Add Task
const addTask = async (columnId: string) => {
  if (!newTaskTitle.value[columnId]?.trim()) return;
  const response = await axios.post("/tasks", {
    description: newTaskTitle.value[columnId],
    status: columnId,
  });

  const column = columns.value.find((col) => col.id === columnId);
  if (column) {
    column.tasks.push(response.data.task);
    newTaskTitle.value[columnId] = "";
    isAddingTask.value[columnId] = false;
  }
  toaster.show(response.data.message, { position: "top-right" });
};

// Delete Task
const deleteTask = async (columnId: string, taskId: number) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;
  try {
    const response = await axios.delete(`/tasks/${taskId}`);
    const column = columns.value.find((col) => col.id === columnId);
    if (column) {
      column.tasks = column.tasks.filter((task) => task.id !== taskId);
    }
    toaster.show(response.data.message, { position: "top-right" });
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

// Save Task Order
const saveTaskOrder = async () => {
  if (!isDragging.value) return;
  try {
    const response = await axios.post("/tasks/reorder", {
      columns: columns.value.map((col) => ({
        id: col.id,
        tasks: col.tasks,
      })),
    });
    toaster.show(response.data.message, { position: "top-right" });
  } catch (error) {
    console.error("Error updating tasks:", error);
  } finally {
    isDragging.value = false;
  }
};

// Watch for task order changes
watchEffect(
  () => columns.value.map((column) => column.tasks),
  saveTaskOrder,
  { deep: true }
);

export default function useKanban() {
  return {
    columns,
    newTaskTitle,
    isAddingTask,
    editingTaskId,
    editedTaskTitle,
    isDragging,
    editTask,
    updateTask,
    cancelEdit,
    fetchTasks,
    addTask,
    deleteTask,
    saveTaskOrder,
  };
}