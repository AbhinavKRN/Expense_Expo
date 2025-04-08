export interface User {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  }
  
  export interface Split {
    userId: string;
    amount: number;
  }
  
  export interface Expense {
    id: string;
    title: string;
    description?: string;
    amount: number;
    category: string;
    date: Date;
    payerId: string;
    groupId: string;
    splits: Split[];
  }
  
  export interface Group {
    id: string;
    name: string;
    description?: string;
    members: User[];
    createdAt: Date;
    createdBy: string;
  }
  
  export interface Balance {
    userId: string;
    amount: number;
  }
  