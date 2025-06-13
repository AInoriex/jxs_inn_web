import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const ROUTER_SERVICE_HOST = 'http://127.0.0.1:32135'; // 后续可改为配置文件读取
// const STREAM_SERVICE_HOST = 'http://127.0.0.1:23145'; // 后续可改为配置文件读取
const STREAM_SERVICE_HOST = 'http://127.0.0.1:32136'; // 后续可改为配置文件读取
export { ROUTER_SERVICE_HOST, STREAM_SERVICE_HOST};

// 定义接口返回的标准结构（假设后端统一返回格式）
export interface ServerApiCommonResponse<T> {
  code: number;
  msg: string;
  data: T;
};

/**
 * 合并和优化 Tailwind CSS 类名
 * @param inputs - 任意数量的 CSS 类名，支持字符串、对象、数组等类型
 * @returns 包含有效且无冲突的 Tailwind CSS 类名的字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
