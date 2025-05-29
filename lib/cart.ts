import { API_BASE_URL } from '@/lib/utils';

// 购物车相关类型定义
export type CartItem = {
  id: string;          // 购物车项ID
  title: string;       // 商品标题
  price: number;       // 商品单价
  quantity: number;    // 商品数量
  image: string;       // 商品图片URL
};

interface CreateCartItemParams {
  productId: string;   // 商品ID（对应接口product_id）
  quantity: number;    // 购买数量
}

interface RemoveCartItemParams {
  cartItemId: string;  // 购物车项ID（对应接口cart_item_id）
}

interface UpdateCartItemParams {
  cartItemId: string;  // 购物车项ID（对应接口cart_item_id）
  quantity: number;    // 新的购买数量
}

/************* 购物车类接口 *************/
export class CartService {
  /**
   * 获取购物车列表
   * @returns 购物车项数组
   */
  static async getList(): Promise<CartItem[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    const res = await fetch(`${API_BASE_URL}/v1/eshop_api/user/cart/list`, {
      headers: { Authorization: token }
    });

    if (!res.ok) throw new Error('获取购物车列表请求失败');
    const jsonData = await res.json();
    if (jsonData.code !== 0) throw new Error(jsonData.msg || '获取购物车列表失败');

    // 打日志
    console.log('CartService.getList: ', jsonData.data);
    console.log('CartService.getList.result: ', jsonData.data.result);
    return jsonData.data.result;
  }

  /**
   * 创建购物车项
   * @param createCartItemParams 商品ID和数量
   * @returns 新创建的购物车项ID
   */
  static async create(createCartItemParams: CreateCartItemParams): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    const res = await fetch(`${API_BASE_URL}/v1/eshop_api/user/cart/create`, {
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

    if (!res.ok) throw new Error('创建购物车项请求失败');
    const jsonData = await res.json();
    if (jsonData.code !== 0) throw new Error(jsonData.msg || '创建购物车项失败');

    return jsonData.data.cart_item_id;
  }

  /**
   * 移除购物车项
   * @param removeCartItemParams 购物车项
   */
  static async remove(removeCartItemParams: RemoveCartItemParams): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    const res = await fetch(`${API_BASE_URL}/v1/eshop_api/user/cart/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ cart_item_id: removeCartItemParams.cartItemId })
    });

    if (!res.ok) throw new Error('移除购物车项请求失败');
    const jsonData = await res.json();
    if (jsonData.code !== 0) throw new Error(jsonData.msg || '移除购物车项失败');
  }
}
