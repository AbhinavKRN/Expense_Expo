import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';

interface UserState {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User | null) => void;
  addUser: (name: string, email?: string, avatar?: string) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },
      
      addUser: (name, email, avatar) => {
        const newUser: User = {
          id: uuidv4(),
          name,
          email,
          avatar,
        };
        
        set((state) => ({
          users: [...state.users, newUser],
        }));
        
        return newUser;
      },
      
      updateUser: (id, data) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...data } : user
          ),
          currentUser: 
            state.currentUser?.id === id 
              ? { ...state.currentUser, ...data } 
              : state.currentUser,
        }));
      },
      
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },
      
      getUserById: (id) => {
        return get().users.find((user) => user.id === id);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
