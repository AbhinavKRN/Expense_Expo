import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Group, User } from '../types';

interface GroupState {
  groups: Group[];
  addGroup: (name: string, description: string, members: User[], currentUserId: string) => Group;
  updateGroup: (id: string, data: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addMemberToGroup: (groupId: string, member: User) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      groups: [],
      
      addGroup: (name, description, members, currentUserId) => {
        const newGroup: Group = {
          id: uuidv4(),
          name,
          description,
          members,
          createdAt: new Date(),
          createdBy: currentUserId,
        };
        
        set((state) => ({
          groups: [...state.groups, newGroup],
        }));
        
        return newGroup;
      },
      
      updateGroup: (id, data) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, ...data } : group
          ),
        }));
      },
      
      deleteGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
        }));
      },
      
      addMemberToGroup: (groupId, member) => {
        set((state) => ({
          groups: state.groups.map((group) => {
            if (group.id === groupId) {
              // Check if member already exists
              const memberExists = group.members.some((m) => m.id === member.id);
              if (!memberExists) {
                return {
                  ...group,
                  members: [...group.members, member],
                };
              }
            }
            return group;
          }),
        }));
      },
      
      removeMemberFromGroup: (groupId, memberId) => {
        set((state) => ({
          groups: state.groups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                members: group.members.filter((member) => member.id !== memberId),
              };
            }
            return group;
          }),
        }));
      },
    }),
    {
      name: 'group-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
