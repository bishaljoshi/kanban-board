<script setup lang="ts">
    import { ref, watchEffect, onMounted } from "vue";
    import axios from "axios";
    import draggable from 'vuedraggable';
    import { createToaster } from "@meforma/vue-toaster";

    // Kanban board columns
    const columns = ref([
        { id: "0", title: "To Do", tasks: [] },
        { id: "1", title: "In Progress", tasks: [] },
        { id: "2", title: "Done", tasks: [] },
    ]);

    const newTaskTitle = ref < Record < string,
        string >> ({});
    const isAddingTask = ref < Record < string,
        boolean >> ({});

    const editingTaskId = ref(null);
    const editedTaskTitle = ref("");

    const isDragging = ref(false);

    const editTask = (task) => {
        editingTaskId.value = task.id;
        editedTaskTitle.value = task.description;
    };

    const toaster = createToaster({ /* options */ });

    // update task
    const updateTask = async (columnId, taskId) => {
        if (!editedTaskTitle.value.trim()) {
            cancelEdit();
            return;
        }

        try {
            const response = await axios.put(`/tasks/${taskId}`, { description: editedTaskTitle.value });

            // Update UI
            const column = columns.value.find(col => col.id === columnId);
            if (column) {
                const task = column.tasks.find(t => t.id === taskId);
                if (task) task.description = editedTaskTitle.value;
            }

            cancelEdit();
            toaster.show(response.data.message, {
                position: "top-right",
            });
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const cancelEdit = () => {
        editingTaskId.value = null;
        editedTaskTitle.value = "";
    };

    // Fetch tasks from Laravel API
    const fetchTasks = async () => {
        try {
            const response = await axios.get("/tasks");
            columns.value.forEach(column => {
                column.tasks = response.data
                    .filter(task => task.status === column.id)
                    .sort((a, b) => a.position - b.position); // Sort by position
            });
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    // Add a new task
    const addTask = async (columnId: string) => {
        if (!newTaskTitle.value[columnId]?.trim()) return;
        const response = await axios.post("/tasks", {
            description: newTaskTitle.value[columnId],
            status: columnId
        });

        const column = columns.value.find(col => col.id === columnId);
        if (column) {
            column.tasks.push(response.data.task);
            newTaskTitle.value[columnId] = "";
            isAddingTask.value[columnId] = false;
        }
        toaster.show(response.data.message, {
            position: "top-right",
        });
    };

    // Delete a task
    const deleteTask = async (columnId: string, taskId: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;
        try {
            const response = await axios.delete(`/tasks/${taskId}`);
            const column = columns.value.find(col => col.id === columnId);
            if (column) {
                column.tasks = column.tasks.filter(task => task.id !== taskId);
            }
            toaster.show(response.data.message, {
                position: "top-right",
            });
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // reorder task
    const saveTaskOrder = async () => {
        if (!isDragging.value) return; // Only proceed if it was a drag-and-drop action
        try {
            const response = await axios.post("/tasks/reorder", {
                columns: columns.value.map((col) => ({
                    id: col.id,
                    tasks: col.tasks,
                })),
            });
            toaster.show(response.data.message, {
                position: "top-right",
            });
        } catch (error) {
            console.error("Error updating tasks:", error);
        } finally {
            isDragging.value = false; // Reset dragging flag
        }
    };

    // Watch for changes in task order and save to DB
    watchEffect(
        () => columns.value.map((column) => column.tasks),
        saveTaskOrder, { deep: true }
    );

    // Fetch tasks on mount
    onMounted(fetchTasks);
</script>

<template>
    <div class="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a] lg:justify-center lg:p-8">
        <!-- Success Message -->
        <div v-if="message" class="w-full bg-green-500 text-white p-2 rounded-lg text-center max-w-4xl mb-4">
            {{ message }}
        </div>
        <div class="items-center justify-center overflow-x-auto">
            <main class="flex flex-col space-y-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0 lg:max-w-6xl">
                <div v-for="column in columns" :key="column.id" class="bg-gray-200 p-4 rounded-lg shadow-md min-w-[280px] w-full flex flex-col min-h-96">
                    <h2 class="text-sm font-semibold text-gray-600 mb-2">{{ column.title }}</h2>
                    
                    <!-- Scrollable Container -->
                    <draggable v-model="column.tasks" group="tasks" @start="isDragging = true" @end="saveTaskOrder" item-key="id" class="flex-grow space-y-2 overflow-y-auto max-h-80 pr-2">
                        <template #item="{ element }">
                            <div class="bg-white p-2 rounded shadow-sm border border-gray-300 flex justify-between items-center cursor-move">
                                <template v-if="editingTaskId === element.id">
                                    <!-- Show input field when editing -->
                                    <input
                                        v-model="editedTaskTitle"
                                        class="border border-gray-300 p-1 rounded w-full text-sm"
                                        autofocus
                                    />
                                    <div class="flex space-x-1 ml-2">
                                        <!-- Update button -->
                                        <button @click="updateTask(column.id, element.id)" class="text-green-500 hover:text-green-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                        </button>
                                        <!-- Cancel button -->
                                        <button @click="cancelEdit" class="text-gray-500 hover:text-gray-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </template>

                                <template v-else>
                                    <span class="text-sm text-gray-700">{{ element.description }}</span>
                                    <div class="flex space-x-2 float-right">
                                        <!-- Edit Icon -->
                                        <button @click="editTask(element)" class="text-gray-500 hover:text-gray-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L7.5 19.313l-4.5 1 1-4.5L16.862 3.487z" />
                                            </svg>
                                        </button>
                                        <!-- Delete Icon -->
                                        <button @click="deleteTask(column.id, element.id)" class="text-gray-500 hover:text-gray-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </template>
                    </draggable>
                    <div v-if="isAddingTask[column.id]" class="mt-2">
                        <input
                            v-model="newTaskTitle[column.id]"
                            type="text"
                            placeholder="Enter task name..."
                            class="w-full p-2 border border-gray-300 rounded text-sm"
                            @keyup.enter="addTask(column.id)"
                        />
                        <div class="flex justify-end mt-1 space-x-2">
                            <button @click="addTask(column.id)" class="text-sm text-blue-500 hover:text-blue-700">Add</button>
                            <button @click="isAddingTask[column.id] = false" class="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                    </div>

                    <button v-else @click="isAddingTask[column.id] = true" class="text-sm text-gray-500 hover:text-gray-700 mt-2 text-left">
                        + Add a card...
                    </button>
                </div>
            </main>
        </div>
        <div class="h-14.5 hidden lg:block"></div>
    </div>
</template>
