
import { db } from './db.ts';
import { Task, TaskStatus, TaskPriority } from '../types.ts';

export const taskService = {
  getTasks: async (userId: string): Promise<Task[]> => {
    await new Promise(r => setTimeout(r, 500));
    return db.getTasks().filter(t => t.userId === userId);
  },

  createTask: async (userId: string, taskData: Partial<Task>): Promise<Task> => {
    await new Promise(r => setTimeout(r, 500));
    const tasks = db.getTasks();
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      userId, // Association with the specific logged-in user
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || TaskStatus.TODO,
      priority: taskData.priority || TaskPriority.MEDIUM,
      dueDate: taskData.dueDate || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    db.saveTasks(tasks);
    return newTask;
  },

  updateTask: async (taskId: string, userId: string, updates: Partial<Task>): Promise<Task> => {
    await new Promise(r => setTimeout(r, 500));
    let tasks = db.getTasks();
    const index = tasks.findIndex(t => t.id === taskId && t.userId === userId);
    if (index === -1) throw new Error('Task not found or access denied');
    
    tasks[index] = { ...tasks[index], ...updates };
    db.saveTasks(tasks);
    return tasks[index];
  },

  deleteTask: async (taskId: string, userId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 500));
    const tasks = db.getTasks().filter(t => !(t.id === taskId && t.userId === userId));
    db.saveTasks(tasks);
  }
};
