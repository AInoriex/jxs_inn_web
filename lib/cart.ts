import { ROUTER_SERVICE_HOST } from '@/lib/utils';
import { withTokenRetry } from '@/lib/utils';

// 购物车相关类型定义
export type CartItem = {
  id: string;          // 商品ID
  title: string;       // 商品标题
  price: number;       // 商品单价
  quantity: number;    // 商品数量
  image: string;       // 商品图片URL
};

interface CreateCartItemParams {
  productId: string;   // 商品ID
  quantity: number;    // 购买数量
}

interface RemoveCartItemParams {
  productId: string;  // 商品ID
}

interface UpdateCartItemParams {
  productId: string;  // 商品ID
  quantity: number;   // 新的购买数量
}

/************* 购物车类接口 *************/
export class CartService {
  /**
   * 获取购物车列表
   * @returns 购物车项数组
   */
  static async GetCartList(): Promise<CartItem[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    return withTokenRetry(async () => {  // 使用通用重试工具
      const res = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/cart/list`, {
        headers: { Authorization: token }
      });

      // 检测401状态并包装错误（传递响应头）
      if (res.status === 401) {
        const error = new Error('401 Unauthorized');
        error['responseHeaders'] = res.headers;  // 关键：传递响应头给重试工具
        throw error;
      }

      if (!res.ok) throw new Error('获取购物车列表请求失败');
      const jsonData = await res.json();
      if (jsonData.code !== 0) throw new Error(jsonData.msg || '获取购物车列表失败');

      console.log('CartService.getList: ', jsonData.data);
      console.log('CartService.getList.result: ', jsonData.data.result);
      return jsonData.data.result;
    });
  }

  /**
   * 创建购物车项
   * @param createCartItemParams 商品ID和数量
   * @returns 新创建的购物车项ID
   */
  static async CreateCart(createCartItemParams: CreateCartItemParams): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    return withTokenRetry(async () => {  // 使用通用重试工具
      const res = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/cart/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({
          product_id: createCartItemParams.productId,
          quantity: createCartItemParams.quantity
        })
      });

      if (res.status === 401) {
        const error = new Error('401 Unauthorized');
        error['responseHeaders'] = res.headers;
        throw error;
      }

      if (!res.ok) throw new Error('创建购物车项请求失败');
      const jsonData = await res.json();
      if (jsonData.code !== 0) throw new Error(jsonData.msg || '创建购物车项失败');

      return jsonData.data.cart_item_id;
    });
  }

  /**
   * 移除购物车项（修改后）
   */
  static async RemoveCart(removeCartItemParams: RemoveCartItemParams): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    return withTokenRetry(async () => {  // 使用通用重试工具
      const resp = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/cart/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ product_id: removeCartItemParams.productId })
      });

      if (resp.status === 401) {
        const error = new Error('401 Unauthorized');
        error['responseHeaders'] = resp.headers;
        throw error;
      }

      if (!resp.ok) throw new Error('移除购物车项请求失败');
      const jsonData = await resp.json();
      if (jsonData.code !== 0) throw new Error(jsonData.msg || '移除购物车项失败');
    });
  }
}
