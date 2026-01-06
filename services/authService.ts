
import { db } from './db';
import { User, AuthResponse } from '../types';

// Simple mock for password hashing & token generation
const mockHash = (str: string) => `hashed_${str}`;
const generateToken = (userId: string) => `jwt_${userId}_${Date.now()}`;

export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    await new Promise(r => setTimeout(r, 800)); // Simulate network latency
    
    if (db.getUserByEmail(email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role: 'user',
      avatar: `https://picsum.photos/seed/${email}/200`,
      createdAt: new Date().toISOString()
    };

    db.saveUser(newUser, mockHash(password));
    const token = generateToken(newUser.id);
    db.setSession(token, newUser);
    
    return { user: newUser, token };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    await new Promise(r => setTimeout(r, 800));
    
    const user = db.getUserByEmail(email);
    const storedHash = db.getPasswordHash(email);

    if (!user || storedHash !== mockHash(password)) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id);
    db.setSession(token, user);
    
    return { user, token };
  },

  logout: () => {
    db.clearSession();
  },

  getCurrentUser: (): User | null => {
    const session = db.getSession();
    return session ? session.user : null;
  }
};
