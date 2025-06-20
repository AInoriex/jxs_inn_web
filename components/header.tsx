'use client';

import { CircleUserRound, Menu, Moon, LogOut, LucideHeartHandshake, ShoppingBag, ShoppingCart, Store, Sun } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout, checkAuth } = useAuth(); // 获取全局user状态和方法
  const router = useRouter();

  // 移除手动维护的isLoggedIn和userInfo，直接使用auth的user状态
  // 初始化检查登录态（替代原useEffect的fetchUserInfo）
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // logout（自动清除token和状态）
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LucideHeartHandshake className="h-6 w-6" />
          <span className="font-semibold text-lg">江心上客栈</span>
        </Link>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="flex items-center gap-2 p-2">
                <Store className="h-5 w-5" />
                商店
              </Link>
              <Link href="/cart" className="flex items-center gap-2 p-2">
                <ShoppingCart className="h-5 w-5" />
                购物车
              </Link>
              <Link href="/inventory" className="flex items-center gap-2 p-2">
                <ShoppingBag className="h-5 w-5" />
                藏品
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            商店
          </Link>
          <Link href="/cart" className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            购物车
          </Link>
          <Link href="/inventory" className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            藏品
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* 使用auth的user状态判断登录 */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {!user?.avatar ? (
                        <CircleUserRound className="h-full w-full" stroke-width="1" />
                      ) : (
                        user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  个人信息
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile/reset-password')}>
                  更改密码
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/auth/login">登录 | 注册</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}