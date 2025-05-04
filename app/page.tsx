import { Search } from '@/components/search';
import { ProductGrid } from '@/components/product-grid';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Search />
      <ProductGrid />
    </div>
  );
}