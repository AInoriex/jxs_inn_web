import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/lib/auth';

const ROUTER_SERVICE_HOST = 'http://127.0.0.1:32135'; // 后续可改为配置文件读取
// const STREAM_SERVICE_HOST = 'http://127.0.0.1:23145'; // 后续可改为配置文件读取
const STREAM_SERVICE_HOST = 'http://127.0.0.1:32136'; // 后续可改为配置文件读取
export { ROUTER_SERVICE_HOST, STREAM_SERVICE_HOST};

/**
 * 合并和优化 Tailwind CSS 类名
 * @param inputs - 任意数量的 CSS 类名，支持字符串、对象、数组等类型
 * @returns 包含有效且无冲突的 Tailwind CSS 类名的字符串
 */
 export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 服务器通用响应体
export interface ServerApiCommonResponse<T> {
  code: number;
  msg: string;
  data: T;
};

// 定义带响应头的扩展 Error 类型
// @Desc  用于携带请求头信息判断是否需要刷新Token
export interface WithResponseHeadersError extends Error {
  responseHeaders?: Headers; // 可选属性（可能不存在）
}

// 通用请求方法用于处理过期Token自动刷新
export async function withTokenRetry<T>(request: () => Promise<T>): Promise<T> {
  let retry = 0;
  const maxRetry = 3;

  while (retry < maxRetry) {
    try {
      return await request();
    } catch (error) {
      // 仅处理401且需要刷新token的场景
      if (
        error instanceof Error &&
        (error as WithResponseHeadersError).responseHeaders?.get('refresh-token') === '1' && // 关键修改：类型断言
        error.message.includes('401')
      ) {
        await useAuth.getState().refreshToken();  // 调用auth的刷新方法
        await new Promise(resolve => setTimeout(resolve, 200));  // 延迟200ms
        retry++;
      } else {
        throw error;  // 其他错误直接抛出
      }
    }
  }
  throw new Error(`请求重试${maxRetry}次后仍失败`);
}

