'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Store, ShoppingCart, Package2, Sun, Moon, Menu, LogOut, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(typeof window !== 'undefined' && !!localStorage.getItem('token'));
  const [userInfo, setUserInfo] = useState<{
    name: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLoggedIn) {
        try {
          const response = await fetch('http://127.0.0.1:32135/v1/eshop_api/user/info', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.code === 0) {
            setUserInfo({
              name: data.data.result.name,
              avatar: data.data.result.avatar_url
            });
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
      }
    };

    fetchUserInfo();
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserInfo(null);
    router.push('/');
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-6 w-6" />
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

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                    <AvatarFallback>
                      {userInfo?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
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