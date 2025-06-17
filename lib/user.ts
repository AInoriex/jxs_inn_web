import { ROUTER_SERVICE_HOST } from '@/lib/utils';
import { withTokenRetry } from '@/lib/utils';

export class UserService {
  /**
   * 更新用户信息
   * @param name 用户名
   * @param avatar_url 头像链接
   * @returns Promise<void>
   */
  static async updateUserInfo(name: string, avatar_url: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    return withTokenRetry(async () => {
      const res = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/update_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ name, avatar_url })
      });

      if (res.status === 401) {
        const error = new Error('401 Unauthorized');
        error['responseHeaders'] = res.headers;
        throw error;
      }

      if (!res.ok) throw new Error('更新用户信息请求失败');
      const jsonData = await res.json();
      if (jsonData.code !== 0) throw new Error(jsonData.msg || '更新用户信息失败');
    });
  }

  /**
   * 重置用户密码
   * @param old_password 旧密码
   * @param new_password 新密码
   * @returns Promise<void>
   */
  static async resetPassword(old_password: string, new_password: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    return withTokenRetry(async () => {
      const res = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ old_password, new_password })
      });

      if (res.status === 401) {
        const error = new Error('401 Unauthorized');
        error['responseHeaders'] = res.headers;
        throw error;
      }

      if (!res.ok) throw new Error('重置密码请求失败');
      const jsonData = await res.json();
      if (jsonData.code !== 0) throw new Error(jsonData.msg || '重置密码失败');
    });
  }
}

