import { ROUTER_SERVICE_HOST } from '@/lib/utils';
import { withTokenRetry, WithResponseHeadersError } from '@/lib/utils';

// 购买历史项
export type PurchaseHistoryItem = {
  id: number;
  order_id: string;
  product_name: string;
  final_amount: number;
  quantity: number;
  purchase_status_desc: string;
  purchase_date: string;
}

/************* 购买历史接口 *************/
export class PurchaseHistoryService {
  /**
   * 查询购买历史记录
   * @returns PurchaseHistoryItem[]
   */
  static async GetList(): Promise<PurchaseHistoryItem[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    return withTokenRetry(async () => {  // 使用通用重试工具
      const resp = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/purchase_history`, {
        method: 'GET',
        headers: { Authorization: token },
      });
  
      // 检测401状态并包装错误（传递响应头）
      if (resp.status === 401) {
        const error = new Error('401 Unauthorized') as WithResponseHeadersError;
        error.responseHeaders = resp.headers;
        throw error;
      }

      if (!resp.ok) throw new Error('请求购买历史记录失败');
      const jsonData = await resp.json();
      if (jsonData.code !== 0) throw new Error(jsonData.msg || '查询购买历史记录失败');
  
      // 格式转换
      // const purchaseHistoryItems: PurchaseHistoryItem[] = jsonData.data.result.map((item: any) => ({
      //   id: item.id,
      //   orderId: item.order_id,
      //   productName: item.product_name,
      //   finalAmount: item.final_amount,
      //   quantity: item.quantity,
      //   purchaseStatusDesc: item.purchase_status_desc,
      //   purchaseDate: item.purchase_date,
      // }));
      return jsonData.data.result;
    });
  }
}