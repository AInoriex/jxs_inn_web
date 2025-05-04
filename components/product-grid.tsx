'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  sales: number;
};

// const mockProducts: Product[] = [
//   {
//     id: '1',
//     title: '地铁.mp3',
//     description: '作为小O的你，在地铁上被陌生女A欺负了？！',
//     price: 29.9,
//     image: 'https://obs-prod-hw-bj-xp-ai-train.obs.cn-north-4.myhuaweicloud.com/QUWAN_DATA/temp_data/%E5%85%B6%E4%BB%96/metro_mp3_cover.jpg',
//     // image: 'https://ucarecdn.com/f58a1bee-1f83-4956-8c05-88e900a387c9/metro_mp3_cover.jpg',
//     sales: 520,
//   },
//   // Add more mock products as needed
// ];

export function ProductGrid() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const timestamp = Date.now();
        const response = await fetch(
          `http://127.0.0.1:32135/v1/eshop_api/product/list?sign=${timestamp}`
        );
        const data = await response.json();

        if (data.code !== 0) {
          toast.error(`请求失败: ${data.msg} (code: ${data.code})`);
          return;
        }

        const formattedProducts = data.data.data.map((product: any) => ({
          id: product.id.toString(),
          title: product.title,
          description: product.description,
          price: product.price,
          image: product.image_url,
          sales: product.sales,
        }));

        setProducts(formattedProducts);
      } catch (error) {
        toast.error('网络请求异常，请稍后重试');
        console.error('Fetch products error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* {mockProducts.map((product) => ( */}
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="aspect-square relative">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate">{product.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold">${product.price}</span>
                <Button size="sm">加入购物车</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.title}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square relative">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">${selectedProduct.price}</h4>
                  <p className="text-sm text-muted-foreground">
                    销量: {selectedProduct.sales}
                  </p>
                </div>
                <p className="text-sm">{selectedProduct.description}</p>
                <div className="flex gap-4">
                  <Button className="flex-1">加入购物车</Button>
                  <Button className="flex-1" variant="secondary">立即购买</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}