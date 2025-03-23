<script setup lang="ts">
    import draggable from "vuedraggable";
    import { onMounted } from "vue";
    import board from "@/composables/board";

    const {
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
    } = board();

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
