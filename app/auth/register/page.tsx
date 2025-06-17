'use client';

import { sha256 } from 'js-sha256';
import { Store, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, sendEmailVerifyCode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingVerifyCode, setIsSendingVerifyCode] = useState(false);
  const [countdown, setCountdown] = useState(0); // 邮箱验证码倒计时（防止重复发送）

  // 发送邮箱验证码
  const sendVerifyCode = async () => {
    if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }
    if (countdown > 0) return;

    setIsSendingVerifyCode(true);
    try {
      await sendEmailVerifyCode(email); // 调用auth封装的方法
      toast.success('验证码已发送至邮箱');
      // 启动60秒倒计时
      let timer = 60;
      setCountdown(timer);
      const interval = setInterval(() => {
        timer--;
        setCountdown(timer);
        if (timer <= 0) clearInterval(interval);
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '验证码发送失败');
    } finally {
      setIsSendingVerifyCode(false);
    }
  };

  // 注册提交表单
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    if (!verifyCode) {
      toast.error('请输入邮箱验证码');
      return;
    }

    setIsLoading(true);
    try {
      const hashedPassword = sha256(password);
      await register(name, email, hashedPassword, verifyCode);
      toast.success('注册成功');
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* 左侧背景部分 */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Store className="mr-2 h-6 w-6" />
          ❤ 欢迎入住江心上客栈 ❤
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "我们的相遇，又是谁人笔下的一场风花雪月的绝唱呢。"
            </p>
            <footer className="text-sm">—— 江夫人_KWKmia</footer>
          </blockquote>
        </div>
      </div>

      {/* 右侧注册部分 */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">创建账号</h1>
            <p className="text-sm text-muted-foreground">店小二：客人，入住前请填写下这些信息哦~</p>
          </div>

          {/* 用户名输入 */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">用户名</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* 邮箱输入 */}
            <div className="space-y-2 relative">
              <Label htmlFor="email">邮箱</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isSendingVerifyCode || countdown > 0}
                  onClick={sendVerifyCode}
                >
                  {countdown > 0 ? `${countdown}s后重试` : '发送验证码'}
                </Button>
              </div>
            </div>

            {/* 验证码输入栏 */}
            <div className="space-y-2">
              <Label htmlFor="verifyCode">邮箱验证码</Label>
              <Input
                id="verifyCode"
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                required
                disabled={isLoading}
                placeholder="请输入邮箱收到的验证码"
              />
            </div>

            {/* 输入密码 */}
            <div className="space-y-2 relative">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* 确认密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating account...' : '创建账号'}
            </Button>
          </form>

          <div className="text-center text-sm">
            入住过的贵客这边请~{' '}
            <Link href="/auth/login" className="underline">点击登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
}