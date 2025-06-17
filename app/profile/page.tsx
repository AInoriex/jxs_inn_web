'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { UserService } from '@/lib/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PersonalInfoPage() {
  const { user, updateUser } = useAuth();
  const [ name, setName ] = useState(user?.name || '');
  const [ isEditing, setIsEditing ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      await UserService.updateUserInfo(name, user?.avatar || '');
      // 更新全局用户状态（同步页面显示）
      if (user) updateUser({ name }); 
      setIsEditing(false);
      toast.success('信息更新成功');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '更新用户信息失败';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false); // 无论成功失败都恢复按钮状态
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">名字</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" value={user.email} disabled />
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting} // 提交时禁用按钮
            >
              {isSubmitting ? '保存中...' : '保存更改'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setName(user.name);
                setIsEditing(false);
              }}
              disabled={isSubmitting} // 提交时禁用按钮
            >
              取消
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={() => setIsEditing(true)}>
            编辑
          </Button>
        )}
      </form>
    </div>
  );
}