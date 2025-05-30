import { ROUTER_SERVICE_HOST, STREAM_SERVICE_HOST } from '@/lib/utils';

// 定义藏品项类型（与接口文档响应结构匹配）
export type InventoryItem = {
  productId: string;          // 藏品(商品)ID
  title: string;              // 藏品标题
  description: string;        // 藏品描述
  imageUrl: string;           // 藏品封面图URL
  purchaseAt: string;         // 购入时间（ISO格式）
};

// 定义流媒体文件类型（根据接口可能的返回类型）
export type StreamFileResponse = Blob;

export class InventoryService {
  /**
   * 获取用户藏品列表
   * @returns 藏品数组
   */
  static async getList(): Promise<InventoryItem[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    const response = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/inventory/list`, {
      headers: { Authorization: token }
    });

    if (!response.ok) throw new Error('获取藏品列表请求失败');
    const jsonData = await response.json();
    if (jsonData.code !== 0) throw new Error(jsonData.msg || '获取藏品列表失败');

    // 转换接口字段（根据文档响应示例调整字段名）
    return jsonData.data.purchase_list.map((item: any) => ({
      productId: item.product_id,
      title: item.title,
      description: item.description,
      imageUrl: item.image_url,
      purchaseAt: item.purchase_at
    }));
  }

  /**
   * 获取流媒体文件二进制流（m3u8索引或.ts分片）
   * @param filename 流媒体文件名（含扩展名）
   * @returns Blob类型的文件内容
   */
  static async getStreamFile(filename: string): Promise<StreamFileResponse> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    const response = await fetch(`${STREAM_SERVICE_HOST}/v1/steaming/player/${filename}`, {
      headers: { Authorization: token }
    });

    if (!response.ok) throw new Error('获取流媒体文件请求失败');
    return response.blob(); // 直接返回二进制内容
  }

  /**
   * 获取流媒体文件的资源链接URL（用于播放）
   * @param filename 流媒体文件名（含扩展名）
   * @returns 资源链接URL
   */
  static getStreamUrl(filename: string): string {
    return `${STREAM_SERVICE_HOST}/v1/steaming/player/${filename}`; 
  }
}
