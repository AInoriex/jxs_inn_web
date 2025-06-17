'use client';

import { sha256 } from 'js-sha256';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserService } from '@/lib/user';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('密码不匹配，请重新确认');
      return;
    }

    setIsLoading(true);
    try {
      await UserService.resetPassword(sha256(currentPassword), sha256(newPassword));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('重置密码成功');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '重置密码失败';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">重置密码</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 旧密码输入框 */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword">旧密码</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isLoading}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {/* 新密码输入框 */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">新密码</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isLoading}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {/* 二次确认密码输入框 */}
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
        {/* 提交按钮 */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '更新中...' : '更新'}
        </Button>
      </form>
    </div>
  );
}