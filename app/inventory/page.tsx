'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type InventoryItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  purchaseDate: string;
};

export default function InventoryPage() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [items] = useState<InventoryItem[]>([
    {
      id: '1',
      title: '地铁.mp3',
      description: '作为小O的你，在地铁上被陌生女A欺负了？！',
      image: 'https://obs-prod-hw-bj-xp-ai-train.obs.cn-north-4.myhuaweicloud.com/QUWAN_DATA/temp_data/%E5%85%B6%E4%BB%96/metro_mp3_cover.jpg',
      // image: 'https://ucarecdn.com/f58a1bee-1f83-4956-8c05-88e900a387c9/metro_mp3_cover.jpg',`
      purchaseDate: '2024-03-15',
    },
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">我的藏品</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedItem(item)}
          >
            <div className="aspect-square relative">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                于 {new Date(item.purchaseDate).toLocaleDateString()} 购入
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video relative">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  于 {new Date(selectedItem.purchaseDate).toLocaleDateString()} 购入
                </p>
                <p className="mt-2">{selectedItem.description}</p>
              </div>
              <Button className="w-full">Download</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}