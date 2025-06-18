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
import { FetchProductList } from '@/lib/product';
import { CartService } from '@/lib/cart';

// 保持类型定义，但建议未来统一放到types目录
export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  sales: number;
};

export function ProductGrid() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const result = await FetchProductList();
        if (result) {
          setProducts(result);
          setError(null);
        } else {
          setError('获取产品列表失败，请稍后重试');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '获取商品列表失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 页面状态：加载中
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto px-4 py-8 text-center">加载中...</div>
      </div>
    );
  }

  // 获取商品列表错误展示
  if (error || products.length === 0) {
    // return <div className="text-center py-8 text-red-500">{error}</div>;
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-medium text-gray-800 mb-2">哎呀~！客栈还没开业？</p>
          <p className="text-gray-500">店小二正在收拾店面，这位客官请稍等片刻...</p>
        </div>
      </div>
    );
  }

  // 加入购物车
  const handleAddToCart = async (productId: string) => {
    setIsAddingToCart(true);
    try {
      // 调用购物车创建接口（默认数量为1）
      const cartItemId = await CartService.CreateCart({
        productId,
        quantity: 1
      });
      toast.success('商品已成功加入购物车');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '加入购物车失败';
      toast.error(errorMsg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? '添加中...' : '加入购物车'}
                </Button>
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
                  <Button
                    className="flex-1"
                    onClick={() => handleAddToCart(selectedProduct.id)}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? '添加中...' : '加入购物车'}
                  </Button>
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