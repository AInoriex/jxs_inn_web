'use client';

import { sha256 } from 'js-sha256';
import { Store, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getRandomBackgroundImage } from '@/lib/asset';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    setBackgroundImage(getRandomBackgroundImage());
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const hashedPassword = sha256(password);
      // 调用auth的login方法
      await login(email, hashedPassword); 
      // 等待用户状态同步完成
      await checkAuth(); 
      toast.success('登录成功');
      router.push('/');
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-screen">
      {/* 左侧背景部分 */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        {/* <div className="relative z-20 flex items-center text-lg font-medium">
          ❤ 欢迎入住 ❤
        </div> */}
        <Image
          src={backgroundImage}
          alt="背景图"
          fill
          className="relative hidden h-full lg:flex dark:border-r bg-cover bg-center"
          style={
            {
              maskImage: 'linear-gradient(to left, transparent 15px, white 200px, white calc(80%), transparent calc(100%))', // 左右15px渐变淡出，颜色改为白色
              WebkitMaskImage: 'linear-gradient(to left, transparent 15px, white 200px, white calc(80%), transparent calc(100%))', // 兼容webkit内核，颜色改为白色
              maskMode: 'alpha', // 仅显示透明部分
              objectFit: 'cover',
            }
          }
        />
        {/* 添加半透明遮罩层（根据图片亮度调整透明度） */}
        <div className="absolute inset-0 bg-zinc-900 opacity-50" />

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "臣服我，赴一场极乐之宴。"
            </p>
            <footer className="text-sm">—— 江夫人_KWKmia</footer>
          </blockquote>
        </div>
      </div>

      {/* 右侧登录部分 */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              欢迎回到客栈~
            </h1>
            <p className="text-sm text-muted-foreground">
              客人今天想宠幸哪位爱妃呢？
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </button>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? '登录中，请稍等片刻...' : '登录'}
            </Button>
          </form>
          <div className="text-center text-sm">
            原来是首次莅临的贵客？{' '}
            <Link href="/auth/register" className="underline">
              点我注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}