import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROUTER_SERVICE_HOST } from '@/lib/utils';

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
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string, verifyCode: string) => void;
  logout: () => void;
  checkAuth: () => void;
  updateUser: (newUser: Partial<User>) => void;
  sendEmailVerifyCode: (email: string) => Promise<void>;
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,

      // 登录
      // 调用登录接口 → 存储token → 获取用户信息
      login: async (email: string, password: string) => {
        try {
          // 1. 调用登录接口获取token
          const loginResp = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!loginResp.ok) throw new Error('登录接口请求失败');
          const loginData = await loginResp.json();
          if (loginData.code !== 0) throw new Error(loginData.msg || '登录失败');

          // 2. 存储token到localStorage
          const token = `${loginData.data.token_type} ${loginData.data.access_token}`;
          localStorage.setItem('token', token);

          // 3. 调用用户信息接口获取详细信息
          const userResp = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/info`, {
            headers: { Authorization: token },
          });

          if (!userResp.ok) throw new Error('用户信息接口请求失败');
          const userData = await userResp.json();
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

      // 登出
      // 清除token和用户状态
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
      },

      // 注册
      register: async (name: string, email: string, password: string, verifyCode: string) => {
        try {
          const registerResp = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, code: verifyCode }),
          });

          if (!registerResp.ok) throw new Error('请求注册接口失败');
          const registerData = await registerResp.json();
          if (registerData.code !== 0) throw new Error(registerData.msg || '注册失败');

        } catch (error) {
          throw error instanceof Error ? error : new Error('注册失败，请稍后再试');
        }
      },

      // 刷新token
      // 请求报错401重新刷新token
      refreshToken: async () => {
        try {
          const refreshResp = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/auth/refresh_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: localStorage.getItem('token') }),
          });
          if (!refreshResp.ok) throw new Error('刷新token接口请求失败');
          const refreshData = await refreshResp.json();
          if (refreshData.code !== 0) throw new Error(refreshData.msg || '刷新token失败');
          // 刷新成功，更新token
          localStorage.setItem('token', refreshData.data.access_token);
        } catch (error) {
          throw error instanceof Error ? error : new Error('刷新token过程发生未知错误');
        }
      },

      // 初始化检查登录态（用于页面刷新后保持登录状态）
      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const userResp = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/info`, {
            headers: { Authorization: token },
          });

          if (!userResp.ok) throw new Error('请求用户信息失败');
          const userData = await userResp.json();

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

      // 用户状态更新方法（支持部分更新）
      updateUser: (newUser) => {
        set(state => ({
          user: state.user ? { ...state.user, ...newUser } : null
        }));
      },

      // 发送邮箱验证码
      sendEmailVerifyCode: async (email: string) => {
        const resp = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/auth/verify_email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!resp.ok) throw new Error('验证码发送失败');
        const data = await resp.json();
        if (data.code !== 0) throw new Error(data.msg || '验证码发送失败');
      },
    }),

    // 持久化用户信息
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
