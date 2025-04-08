import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Expense, Split, Balance } from '../types';

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByGroup: (groupId: string) => Expense[];
  calculateBalances: (groupId: string) => Balance[];
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      
      addExpense: (expenseData) => {
        const newExpense: Expense = {
          id: uuidv4(),
          ...expenseData,
        };
        
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
        
        return newExpense;
      },
      
      updateExpense: (id, data) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...data } : expense
          ),
        }));
      },
      
      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },
      
      getExpensesByGroup: (groupId) => {
        return get().expenses.filter((expense) => expense.groupId === groupId);
      },
      
      calculateBalances: (groupId) => {
        const groupExpenses = get().getExpensesByGroup(groupId);
        const balanceMap = new Map<string, number>();
        
        // Calculate net balances for each user
        groupExpenses.forEach((expense) => {
          // Add amount to payer
          const payerBalance = balanceMap.get(expense.payerId) || 0;
          balanceMap.set(expense.payerId, payerBalance + expense.amount);
          
          // Subtract split amounts from each user
          expense.splits.forEach((split) => {
            const userBalance = balanceMap.get(split.userId) || 0;
            balanceMap.set(split.userId, userBalance - split.amount);
          });
        });
        
        // Convert map to array of Balance objects
        const balances: Balance[] = [];
        balanceMap.forEach((amount, userId) => {
          balances.push({ userId, amount });
        });
        
        return balances;
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
