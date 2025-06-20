'use client';

import { useAuth } from '@/lib/auth';
import { PurchaseHistoryService, PurchaseHistoryItem } from '@/lib/purchase_history';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PurchaseHistoryPage() {
  const { user, checkAuth } = useAuth();
  const [PurchaseHistoryItems, setPurchaseHistoryItems] = useState<PurchaseHistoryItem[]>([]);

  if (!user) return null;

  // 加载购物车数据
  useEffect(() => {
    const loadCartData = async () => {
      try {
        // 主动同步用户状态（替代依赖 user 的异步变化）
        await checkAuth();

        // 同步后再次检查登录状态
        if (!user) {
          toast.warning('请登录后查看');
          return;
        }

        const items = await PurchaseHistoryService.GetList();
        // 检查 PurchaseHistoryItem 是否为数组
        if (!Array.isArray(items)) {
          // throw new Error('购物车数据为空');
          return;
        }
        setPurchaseHistoryItems(items);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '获取购物车失败');
      } finally {
        // setIsLoading(false);
      }
    };

    loadCartData();
  }, [checkAuth]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">购买历史</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>商品</TableHead>
            <TableHead>订单ID</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>数量</TableHead>
            <TableHead>支付状态</TableHead>
            <TableHead>购入时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PurchaseHistoryItems.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.product_name}</TableCell>
              <TableCell>{purchase.order_id}</TableCell>
              <TableCell>{purchase.final_amount}</TableCell>
              <TableCell>{purchase.quantity}</TableCell>
              <TableCell>{purchase.purchase_status_desc}</TableCell>
              <TableCell>{new Date(purchase.purchase_date).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
