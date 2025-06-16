'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { CartService } from '@/lib/cart';
import { OrderService } from '@/lib/order';

// 购物车商品展示
type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, checkAuth } = useAuth(); // 获取auth的user状态和checkAuth方法
  const [isLoading, setIsLoading] = useState(false); // 结账加载状态

  // 加载购物车数据
  useEffect(() => {
    const loadCartData = async () => {
      setIsLoading(true);
      try {
        // 主动同步用户状态（替代依赖 user 的异步变化）
        await checkAuth();
        
        // 同步后再次检查登录状态
        if (!user) {
          toast.warning('请登录后查看');
          return;
        }

        const items = await CartService.GetCartList();
        // 检查 cartItems 是否为数组
        if (!Array.isArray(items)) { 
          // throw new Error('购物车数据为空');
          return;
        }
        setCartItems(items);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '获取购物车失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadCartData();
}, [checkAuth]); // 仅依赖 checkAuth（需保证其引用稳定）

 // 使用 useMemo 计算小计
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  // 运费固定为 0，使用 useMemo 缓存
  const shipping = useMemo(() => 0, []);

  // 使用 useMemo 计算总计
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  // 更新购物车商品数量
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    // HARDNEED: 当前商品数量限制为1
    if (newQuantity > 1) {
      toast.warning('当前商品不支持多件购买');
      return;
    }
    setCartItems(items =>
      items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
    // TODO: 调用CartService.update接口同步后端（需补充update方法）
  };

  // 移除商品
  const removeItem = async (id: string) => {
    try {
      await CartService.RemoveCart({ productId: id }); // 调用购物车服务移除接口
      setCartItems(items => items.filter(item => item.id !== id));
      toast.success('商品已移除');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '移除商品失败');
    }
  };

  // 结账逻辑
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.warning('购物车为空');
      return;
    }

    setIsLoading(true);
    try {
      // 构造订单参数（从购物车数据转换）
      const createOrderResp = await OrderService.Create({
        itemList: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        paymentMethod: 'qrcode',
        paymentGatewayType: 10
      });
      console.log(`订单创建成功，订单ID：${createOrderResp.orderId}，二维码：${createOrderResp.qrCode}`);
      toast.success(`订单创建成功`);
      // TODO: 跳转至支付页面或订单详情页
      // router.push(`/order/${orderId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '结账失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">购物车</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                <div className="relative w-24 h-24">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${item.price}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-20 text-center"
                      min="1"
                      max="1" // 与数量限制同步
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">账单</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>小计</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>总计</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? '结账中...' : '立即结账'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}