import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE_URL } from '@/lib/utils';

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
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,

      // 登录流程：调用登录接口 → 存储token → 获取用户信息
      login: async (email: string, password: string) => {
        try {
          // 1. 调用登录接口获取token
          const loginRes = await fetch(`${API_BASE_URL}/v1/eshop_api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!loginRes.ok) throw new Error('登录接口请求失败');
          const loginData = await loginRes.json();
          if (loginData.code !== 0) throw new Error(loginData.msg || '登录失败');

          // 2. 存储token到localStorage（格式："Bearer <token>"）
          const token = `${loginData.data.token_type} ${loginData.data.access_token}`;
          localStorage.setItem('token', token);

          // 3. 调用用户信息接口获取详细信息
          const userRes = await fetch(`${API_BASE_URL}/v1/eshop_api/user/info`, {
            headers: { Authorization: token },
          });

          if (!userRes.ok) throw new Error('用户信息接口请求失败');
          const userData = await userRes.json();
          if (userData.code !== 0) {
            localStorage.removeItem('token'); // 信息获取失败时清除无效token
            throw new Error(userData.msg || '获取用户信息失败');
          }

          // 4. 更新用户状态（注意接口字段与User类型的映射）
          set({
            user: {
              id: userData.data.id || 'temp-id', // 假设接口返回id
              email: userData.data.email,
              name: userData.data.name,
              avatar: userData.data.avatar_url,
              purchaseHistory: [], // 购买历史需通过其他接口获取（后续补充）
            },
          });
        } catch (error) {
          throw error instanceof Error ? error : new Error('登录过程发生未知错误');
        }
      },

      // 登出流程：清除token和用户状态
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
      },

      // 新增：注册逻辑（调用注册接口）
      register: async (name: string, email: string, password: string) => {
        try {
          const registerRes = await fetch(`${API_BASE_URL}/v1/eshop_api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }), // name可选，接口文档允许为空
          });

          if (!registerRes.ok) throw new Error('注册接口请求失败');
          const registerData = await registerRes.json();
          if (registerData.code !== 0) throw new Error(registerData.msg || '注册失败');

        } catch (error) {
          throw error instanceof Error ? error : new Error('注册过程发生未知错误');
        }
      },

      // 更新用户信息
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      // 更新密码（保持原有逻辑，后续可补充API调用）
      updatePassword: async (oldPassword: string, newPassword: string) => {
        if (oldPassword !== 'mock-password') { // 实际应调用密码修改接口
          throw new Error('旧密码错误');
        }
      },

      // 初始化检查登录态（用于页面刷新后保持登录状态）
      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const userRes = await fetch(`${API_BASE_URL}/v1/eshop_api/user/info`, {
            headers: { Authorization: token },
          });

          if (!userRes.ok) throw new Error('用户信息接口请求失败');
          const userData = await userRes.json();

          if (userData.code === 0) {
            set({
              user: {
                id: 'temp-id',
                email: userData.data.email,
                name: userData.data.name,
                avatar: userData.data.avatar_url,
                purchaseHistory: [],
              },
            });
          } else {
            throw new Error(userData.msg || '无效的登录状态');
          }
        } catch (error) {
          localStorage.removeItem('token'); // 清除无效token
          set({ user: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // 仅持久化用户信息
    }
  )
);
