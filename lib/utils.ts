import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const API_BASE_URL = 'http://127.0.0.1:32135'; // 后续可改为配置文件读取

// 导出 API_BASE_URL
export { API_BASE_URL };

/**
 * 合并和优化 Tailwind CSS 类名
 * @param inputs - 任意数量的 CSS 类名，支持字符串、对象、数组等类型
 * @returns 包含有效且无冲突的 Tailwind CSS 类名的字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
