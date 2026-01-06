
import React, { useState, useEffect, useMemo } from 'react';
import { User, Task, TaskStatus, TaskPriority } from '../types.ts';
import { taskService } from '../services/taskService.ts';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Task Form State
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: TaskPriority.MEDIUM,
    dueDate: new Date().toISOString().slice(0, 16)
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks(user.id);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user.id]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    try {
      const created = await taskService.createTask(user.id, {
        ...newTask,
        dueDate: new Date(newTask.dueDate).toISOString(),
        status: TaskStatus.TODO
      });
      setTasks([created, ...tasks]);
      setIsModalOpen(false);
      setNewTask({ 
        title: '', 
        description: '', 
        priority: TaskPriority.MEDIUM,
        dueDate: new Date().toISOString().slice(0, 16)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await taskService.updateTask(taskId, user.id, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId, user.id);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    pending: tasks.filter(t => t.status !== TaskStatus.COMPLETED).length
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Personal Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500">Managing tasks for <span className="font-semibold text-slate-700">{user.email}</span></p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <i className="fas fa-plus"></i>
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <i className="fas fa-list-check text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Total Tasks</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <i className="fas fa-clock text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-800">{tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
              <i className="fas fa-check-double text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Finished</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.completed}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
            {['all', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === s 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="relative">
            <i className="fas fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder="Search your tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full md:w-64 text-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 text-center text-slate-400">
               <i className="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
               <p>Loading your workspace...</p>
             </div>
          ) : filteredTasks.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="px-6 py-4">Task Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className={`task-row-transition group ${task.status === TaskStatus.COMPLETED ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                           onClick={() => handleUpdateStatus(task.id, task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED)}
                           className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${
                             task.status === TaskStatus.COMPLETED 
                               ? 'bg-indigo-600 border-indigo-600 text-white' 
                               : 'border-slate-300 hover:border-indigo-400 bg-white'
                           }`}
                        >
                          {task.status === TaskStatus.COMPLETED && (
                            <i className="fas fa-check text-[10px] animate-checkPop"></i>
                          )}
                        </button>
                        <div>
                          <p className={`font-medium transition-all duration-500 ${
                            task.status === TaskStatus.COMPLETED 
                              ? 'text-slate-400 line-through opacity-70 translate-x-1' 
                              : 'text-slate-700'
                          }`}>
                            {task.title}
                          </p>
                          <p className={`text-xs transition-all duration-500 ${
                            task.status === TaskStatus.COMPLETED 
                              ? 'text-slate-300 line-through opacity-50' 
                              : 'text-slate-400'
                          } truncate max-w-[200px]`}>
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors duration-500 ${
                        task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 text-emerald-500 opacity-60' :
                        task.status === TaskStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium flex items-center gap-1.5 transition-opacity duration-500 ${
                        task.status === TaskStatus.COMPLETED ? 'opacity-40' : 'opacity-100'
                      } ${
                        task.priority === TaskPriority.HIGH ? 'text-rose-600' :
                        task.priority === TaskPriority.MEDIUM ? 'text-amber-600' :
                        'text-blue-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          task.priority === TaskPriority.HIGH ? 'bg-rose-600' :
                          task.priority === TaskPriority.MEDIUM ? 'bg-amber-600' :
                          'bg-blue-600'
                        }`}></span>
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm transition-colors duration-500 ${
                      task.status === TaskStatus.COMPLETED ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleUpdateStatus(task.id, TaskStatus.IN_PROGRESS)}
                           className="p-1.5 text-slate-400 hover:text-indigo-600" title="Set In Progress"
                         >
                           <i className="fas fa-play"></i>
                         </button>
                         <button 
                           onClick={() => handleDeleteTask(task.id)}
                           className="p-1.5 text-slate-400 hover:text-rose-600" title="Delete Task"
                         >
                           <i className="fas fa-trash-alt"></i>
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-folder-open text-slate-300 text-2xl"></i>
               </div>
               <h3 className="text-slate-800 font-semibold mb-1">Your list is empty</h3>
               <p className="text-slate-500 text-sm mb-6">Start organizing your personal tasks now.</p>
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="text-indigo-600 font-medium hover:underline text-sm"
               >
                 Create your first task
               </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-pop">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">New Personal Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Finish project report"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Details about the task..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-900"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
