'use client';

import Image from 'next/image';
import { Minus, Plus, X, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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

// 添加支付响应类型（根据OrderService.Create返回值）
type CreateOrderResp = {
  orderId: string;
  qrCode: string;
};

export default function CartPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentData, setPaymentData] = useState<CreateOrderResp | null>(null); // 支付数据
  const [isLoading, setIsLoading] = useState(false); // 下单加载状态（防止重复创建订单）
  const [isPaymentVisible, setIsPaymentVisible] = useState(false); // 支付子页面展示状态
  const paymentCountdownMinutesLimit = 3; // HARDNEED 支付倒计时限制（分钟）
  const [countdown, setCountdown] = useState(paymentCountdownMinutesLimit * 60); // 设置支付倒计时
  const pollingTimer = useRef<NodeJS.Timeout | null>(null); // 轮询支付状态定时器
  const countdownTimer = useRef<NodeJS.Timeout | null>(null); // 支付倒计时定时器

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
  }, [checkAuth]);

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

  // 结账&创建订单
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
      // console.log(`订单创建成功，订单ID：${createOrderResp.orderId}，二维码：${createOrderResp.qrCode}`);
      toast.success(`订单创建成功`);

      // 打开支付子页面并初始化数据
      setPaymentData(createOrderResp);
      setIsPaymentVisible(true);
      setCountdown(paymentCountdownMinutesLimit * 60); // 重置倒计时
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '结账失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 支付状态轮询逻辑（当支付页面显示且有订单数据时启动轮询）
  useEffect(() => {
    if (isPaymentVisible && paymentData?.orderId) {
      pollingTimer.current = setInterval(async () => {
        try {
          const isPaid = await OrderService.GetStatus(paymentData.orderId);
          if (isPaid) {
            toast.success('支付成功');
            handleClosePayment();
            // 跳转到`藏品`页面
            router.push(`/inventory`);
          }
        } catch (error) {
          console.error('轮询支付状态失败:', error);
        }
      }, 2000);
    }
    return () => {
      if (pollingTimer.current) clearInterval(pollingTimer.current);
    };
  }, [isPaymentVisible, paymentData]);

  // 倒计时逻辑（当支付页面显示且倒计时大于0时启动倒计时）
  useEffect(() => {
    if (isPaymentVisible && countdown > 0) {
      countdownTimer.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleClosePayment();
      toast.error('支付超时，请重新创建订单');
    }
    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [isPaymentVisible, countdown]);

  // 统一关闭关闭支付子页面处理函数
  const handleClosePayment = () => {
    // 清除轮询定时器
    if (pollingTimer.current) {
      clearInterval(pollingTimer.current);
      pollingTimer.current = null;
    }
    // 清除倒计时定时器
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    // 关闭支付页面
    setIsPaymentVisible(false);
  };

  // 处理订单咨询
  const handleOrderQuery = async () => {
    if (paymentData?.orderId) {
      try {
        // 复制订单ID到剪贴板
        await navigator.clipboard.writeText(paymentData.orderId);
        toast.info('已复制订单ID，即将联系客服邮箱`judymike2025@outlook.com`...');
        // 延迟2秒
        await new Promise(resolve => setTimeout(resolve, 2000));
        // 跳转新页面编写邮件咨询客服
        window.open(`mailto:judymike2025@outlook.com?subject=我想咨询关于订单 ${paymentData.orderId} 的问题`,'_blank')
      } catch (err) {
        toast.error(`当前订单ID为'${paymentData.orderId}'，请联系客服邮箱: judymike2025@outlook.com`);
      }
    } else {
      toast.error('获取订单ID失败，请联系客服邮箱: judymike2025@outlook.com');
    }
  };

  // 支付子页面组件
  const PaymentModal = () => (
    isPaymentVisible && paymentData &&  (
    <Dialog 
      open={isPaymentVisible} 
      onOpenChange={() => setIsPaymentVisible(false)}
    >
      <DialogContent className="p-6 text-center">
        {/* 倒计时文本 */}
        <div className="text-lg font-medium mb-2">
          请于 {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')} 之内完成支付
        </div>

        {/* 二维码展示 */}
        <img
          src={`data:image/png;base64,${paymentData.qrCode}`}
          alt="支付二维码"
          className="w-48 h-48 mx-auto mb-2 rounded-lg"
        />

        {/* 订单疑惑文本 */}
        <div className="text-sm text-gray-500 italic cursor-pointer flex items-center justify-center" onClick={handleOrderQuery}>
          ❔ 对此订单有疑惑，请点击我联系客服
        </div>

        {/* 付款须知 */}
        <div className="text-sm text-red-500 underline mb-2 cursor-pointer flex items-center justify-center">
          <TriangleAlert className="h-5 w-5 flex-shrink-0" />
          虚拟商品一经售出，概不退换退款
        </div>

        {/* 取消支付按钮 */}
        <Button
          variant="outline"
          className="text-red-600 font-bold underline"
          onClick={handleClosePayment}
        >
          取消支付
        </Button>
      </DialogContent>
    </Dialog>
    )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 购物车页面渲染 */}
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

       {/* 添加支付子页面渲染 */}
      {PaymentModal()}
    </div>
  );
}