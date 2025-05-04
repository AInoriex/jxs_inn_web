'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Search() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <Input
        type="search"
        placeholder="搜索商品..."
        className="sm:flex-1"
      />
      <Select defaultValue="newest">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">最新</SelectItem>
          <SelectItem value="best-selling">畅销量</SelectItem>
          <SelectItem value="price-high">价格：从高到低</SelectItem>
          <SelectItem value="price-low">价格：从低到高</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}