'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { sha256 } from 'js-sha256';

export default function LoginPage() {
  const router = useRouter();
  // const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const hashedPassword = sha256(password);
      const response = await fetch('http://127.0.0.1:32135/v1/eshop_api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'email': email,
          'password': hashedPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('登录失败，请稍后再试');
      }

      const json_data = await response.json();
      const err_msg = json_data.msg
      if (json_data.code !== 0) {
        throw new Error(err_msg);
      }

      const token_type = json_data.data.token_type;
      const access_token = json_data.data.access_token;
      if (token_type === '' || access_token === '') {
        throw new Error('系统繁忙，请稍后再试');
      }
      localStorage.setItem('token', token_type + ' ' + access_token);
      toast.success('登录成功');
      router.push('/');
    } catch (error) {
      // toast.error('登录失败，请检查您的邮箱和密码');
      toast.error(String(error))
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Store className="mr-2 h-6 w-6" />
          江心上客栈
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "臣服我，赴一场极乐之宴。"
            </p>
            <footer className="text-sm">—— 江夫人_KWKmia</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              欢迎回到客栈~
            </h1>
            <p className="text-sm text-muted-foreground">
              店小二：客人今天想宠幸哪位爱妃呢？
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