import { Search } from '@/components/search';
import { ProductGrid } from '@/components/product-grid';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 暂时屏蔽商品搜索功能 */}
      {/* <Search /> */}
      <ProductGrid />
    </div>
  );
}