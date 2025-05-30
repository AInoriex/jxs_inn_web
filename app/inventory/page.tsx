'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { InventoryService, InventoryItem as ApiInventoryItem } from '@/lib/inventory';


// 转换接口类型到页面使用类型
type PageInventoryItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  purchaseAt: string;
  streamFilename: string;
};

export default function InventoryPage() {
  const [selectedItem, setSelectedItem] = useState<PageInventoryItem | null>(null);
  const [items, setItems] = useState<PageInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // 获取藏品数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiItems = await InventoryService.getList();
        // 转换接口字段并补充流媒体文件名（示例假设文件名与productId一致）
        const pageItems = apiItems.map((item: ApiInventoryItem) => ({
          id: item.productId,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          purchaseAt: item.purchaseAt,
          streamFilename: `${item.productId}.m3u8` // 根据实际业务调整命名规则
        }));
        setItems(pageItems);
      } catch (error) {
        console.error('获取藏品失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 点击藏品详情信息
  const handleItemClick = async (item: PageInventoryItem) => {
    setSelectedItem(item);
    try {
      const blob = await InventoryService.getStreamFile(item.streamFilename);
      if (!blob) {
        throw new Error('请求音频文件失败');
      }
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '获取音频文件失败');
    }
  };

  // 清理音频URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl); // 释放资源
      }
    };
  }, [audioUrl]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">加载中...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl font-medium text-gray-800 mb-2">这里空空如也...</p>
          <p className="text-gray-500">快去挑选喜欢的商品，把它们加入你的藏品吧~</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">我的藏品</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleItemClick(item)}
          >
            <div className="aspect-square relative">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                于 {new Date(item.purchaseAt).toLocaleDateString()} 购入
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedItem}
        onOpenChange={() => {
          setSelectedItem(null);
          setAudioUrl(null); // 关闭对话框时清空音频URL
        }}
      >
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && audioUrl && (
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {/* 藏品信息栏 */}
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="mt-2 text-gray-700">{selectedItem.description}</p>
                </div>
              </div>

              {/* 音频播放器栏 */}
              <div className="flex flex-col justify-center">
                
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
