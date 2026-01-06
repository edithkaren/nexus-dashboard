
import { User, Task } from '../types';

const USERS_KEY = 'nexus_users';
const TASKS_KEY = 'nexus_tasks';
const SESSION_KEY = 'nexus_session';

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveUser: (user: User, passwordHash: string) => {
    const users = db.getUsers();
    const passwords = JSON.parse(localStorage.getItem('nexus_passwords') || '{}');
    users.push(user);
    passwords[user.email] = passwordHash;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem('nexus_passwords', JSON.stringify(passwords));
  },
  getUserByEmail: (email: string) => {
    return db.getUsers().find(u => u.email === email);
  },
  getPasswordHash: (email: string): string | null => {
    const passwords = JSON.parse(localStorage.getItem('nexus_passwords') || '{}');
    return passwords[email] || null;
  },
  getTasks: (): Task[] => {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },
  getSession: () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },
  setSession: (token: string, user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
  },
  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};
