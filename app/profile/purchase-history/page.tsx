'use client';

import { useAuth } from '@/lib/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PurchaseHistoryPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Purchase History</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Purchase Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {user.purchaseHistory.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.productName}</TableCell>
              <TableCell>${purchase.price.toFixed(2)}</TableCell>
              <TableCell>
                {new Date(purchase.purchaseDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}