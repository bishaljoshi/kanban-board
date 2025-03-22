<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Task;

class BoardController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Board');
    }

    public function index()
    {
        return Task::all();
    }

    public function store(Request $request)
    {
        // Fetch the latest task as per position in descending order
        $latestTaskPosition = Task::select('position')
            ->where('status', $request->status)
            ->orderBy('position','desc')
            ->first();

        // Create a task
        $task = Task::create([
            'description' => $request->description,
            'status' => $request->status,
            'position' => !empty($latestTaskPosition) ? $latestTaskPosition->position + 1 : 0,
            'created_by' => 1
        ]);
        
        // return the response
        return response()->json([
            'task'      => $task,
            'status'    => 200,
            'message'   => 'Task added successfully!'
        ]);
    }

    public function update(Request $request, $id)
    {
        // Fetch the task by id or throw error
        $task = Task::findOrFail($id);

        // If task is available, update it
        if($task) {
            $task->update([
                'description'   => $request->description, 
                'updated_by'    => 1, 
                'updated_at'    => now()
            ]);
            
            // return the response
            return response()->json([
                'status'    => 200,
                'message'   => 'Task updated successfully!'
            ]);
        }
    }

    public function destroy($id)
    {
        // Fetch the task by id or throw error
        $task = Task::findOrFail($id);

        // If task is available, update deleted_by and deleted_at
        if($task) {
            $task->update([
                'deleted_by' => 1,
                'deleted_at' => now()
            ]);
            $msg = 'Task deleted successfully!';
        } else {
            $msg = 'Failed to update!';
        }

        // return the response
        return response()->json([
            'status'  => 200, 
            'message' => $msg
        ]);
    }

    public function reorder(Request $request)
    {
        foreach ($request->columns as $column) {
            foreach ($column['tasks'] as $index => $task) {
                Task::where('id', $task['id'])->update([
                    'status' => $column['id'], // Update task status (column)
                    'position' => $index, // Update order
                ]);
            }
        }
    
        // return the response
        return response()->json([
            'message' => 'Task updated successfully!'
        ]);
    }
}
