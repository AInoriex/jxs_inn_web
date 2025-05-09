'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('请登陆后查看');
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await fetch('http://127.0.0.1:32135/v1/eshop_api/user/cart/list', {
          headers: {
            'Authorization': `${token}`
          }
        });
        const data = await response.json();
        if (data.code === 0) {
          setCartItems(data.data.result);
        }
      } catch (error) {
        toast.error('获取购物车失败');
      }
    };

    fetchCartItems();
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0); // 商品总价
  const shipping = 0; // 运费
  const total = subtotal + shipping; // 最终金额

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
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
              <Button className="w-full">老板娘，结账！</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}