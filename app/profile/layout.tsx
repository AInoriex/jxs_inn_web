'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <Tabs
            defaultValue="personal-info"
            className="w-full"
            orientation="vertical"
          >
            <TabsList className="flex flex-col h-auto w-full space-y-2">
              <TabsTrigger
                value="personal-info"
                className="w-full justify-start px-3 py-2"
                onClick={() => router.push('/profile')}
              >
                <span className="truncate">个人信息</span>
              </TabsTrigger>
              <TabsTrigger
                value="purchase-history"
                className="w-full justify-start px-3 py-2"
                onClick={() => router.push('/profile/purchase-history')}
              >
                <span className="truncate">历史账单</span>
              </TabsTrigger>
              <TabsTrigger
                value="reset-password"
                className="w-full justify-start px-3 py-2"
                onClick={() => router.push('/profile/reset-password')}
              >
                <span className="truncate">重置密码</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}