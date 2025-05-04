import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  purchaseHistory: {
    id: string;
    productName: string;
    price: number;
    purchaseDate: string;
  }[];
};

type AuthStore = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
};

// Mock user data
const mockEmail = 'jmy@163.com';
const mockPassword = '123456';
const mockUser: User = {
  id: '1',
  email: mockEmail,
  name: '江夫人',
  avatar: 'https://obs-prod-hw-bj-xp-ai-train.obs.cn-north-4.myhuaweicloud.com/QUWAN_DATA/temp_data/%E5%85%B6%E4%BB%96/jmy_avatar.webp',
  // avatar: 'https://ucarecdn.com/34e271b8-e861-4c33-8dd0-f23a82177cf7/jmy_avatar.webp',
  purchaseHistory: [
    {
      id: '1',
      productName: '地铁.mp3',
      price: 29.9,
      purchaseDate: '2024-03-15',
    },
    {
      id: '2',
      productName: '爱心包裹.mp3',
      price: 520.00,
      purchaseDate: '2025-04-17',
    },
  ],
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: async (email: string, password: string) => {
        if (email === mockEmail && password === mockPassword) {
          set({ user: mockUser });
        } else {
          throw new Error('Invalid credentials');
        }
      },
      logout: () => {
        set({ user: null });
      },
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
      updatePassword: async (oldPassword: string, newPassword: string) => {
        if (oldPassword !== mockPassword) {
          throw new Error('Invalid current password');
        }
        // In a real app, we would make an API call here
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);