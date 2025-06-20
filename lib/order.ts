import { ROUTER_SERVICE_HOST } from '@/lib/utils';

// 订单相关类型定义
export type OrderItem = {
  productId: string;   // 商品ID
  quantity: number;    // 购买数量
};

// 创建订单请求体
interface CreateOrderParams {
  itemList: OrderItem[];                  // 商品列表
  paymentMethod: 'qrcode' | 'bank' | 'point'; // 支付方式
  paymentGatewayType: 10 | 11 | 12;       // 支付网关类型（10:原力通, 11:支付宝, 12:微信）
}

// 创建订单响应体
export type CreateOrderResp = {
  orderId: string;
  qrCode: string;
}

/************* 订单类接口 *************/
export class OrderService {
  /**
   * 创建订单
   * @param createOrderParams 订单参数（商品列表、支付方式等）
   * @returns 新创建的订单ID
   */
  static async Create(createOrderParams: CreateOrderParams): Promise<CreateOrderResp> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    const res = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/order/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        item_list: createOrderParams.itemList.map(item => ({
          product_id: item.productId,
          quantity: item.quantity
        })),
        payment_method: createOrderParams.paymentMethod,
        payment_gateway_type: createOrderParams.paymentGatewayType
      })
    });

    if (!res.ok) throw new Error('创建订单请求失败');
    const jsonData = await res.json();
    if (jsonData.code !== 0) throw new Error(jsonData.msg || '创建订单失败');
    if (!jsonData.data.order_id || !jsonData.data.qrcode) {
      throw new Error('创建订单失败，缺少订单ID或二维码');
    }

    return {
      orderId: jsonData.data.order_id,
      qrCode: jsonData.data.qrcode,
    };
  }

  /**
   * 获取订单状态
   * @param orderId 订单ID
   * @returns 订单状态信息
   */
  static async GetStatus(orderId: string): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('用户未登录');

    const res = await fetch(`${ROUTER_SERVICE_HOST}/v1/eshop_api/user/order/status?order_id=${orderId}`, {
      headers: { Authorization: token }
    });

    if (!res.ok) throw new Error('请求订单状态失败');
    const jsonData = await res.json();
    if (jsonData.code !== 0) return false;

    return true;
  }
}
