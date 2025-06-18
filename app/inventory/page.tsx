'use client';

import { Play, Pause, SkipForward, SkipBack, VolumeX, Volume2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player'; // 引入ReactPlayer
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider'; // 使用项目UI库的滑块组件
import { useAuth } from '@/lib/auth';
import { InventoryService, InventoryItem } from '@/lib/inventory';

// 转换接口类型到页面使用类型
type PageInventoryItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  purchaseAt: string;
  streamFilename: string;
};

// 音频播放器状态类型
type AudioPlayerState = {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  seeking: boolean;
};

export default function InventoryPage() {
  const { user, checkAuth } = useAuth();
  const [items, setItems] = useState<PageInventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PageInventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // 加载藏品数据
  useEffect(() => {
    const loadInventoryData = async () => {
      setLoading(true);
      try {
        // 主动同步用户状态（替代依赖 user 的异步变化）
        await checkAuth();

        // 同步后再次检查登录状态
        if (!user) {
          toast.warning('请登录后查看');
          return;
        }

        const apiItems = await InventoryService.getList();
        // 转换接口字段并补充流媒体文件名
        const pageItems = apiItems.map((item: InventoryItem) => ({
          id: item.productId,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          purchaseAt: item.purchaseAt,
          streamFilename: `${item.productId}.m3u8`
        }));
        setItems(pageItems);
      } catch (error) {
        toast.error('获取藏品信息失败，请稍后重试');
        // console.error(`获取藏品信息失败，错误信息：${error}`);
      } finally {
        setLoading(false);
      }
    };

    loadInventoryData();
  }, [checkAuth]);

  // 点击藏品详情信息
  const handleItemClick = async (item: PageInventoryItem) => {
    setSelectedItem(item);
    try {
      const url = InventoryService.getStreamUrl(item.streamFilename);
      setAudioUrl(url);
      setAudioState(prev => ({ ...prev, playing: true })); // 自动播放
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '读取音频失败');
    }
  };

  // 页面状态：加载中
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto px-4 py-8 text-center">加载中...</div>
      </div>
    );
  }

  // 页面状态：空藏品展示
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-medium text-gray-800 mb-2">这里空空如也...</p>
            <p className="text-gray-500">快去挑选喜欢的商品，把它们加入你的藏品吧~</p>
          </div>
        </div>
      </div>
    );
  }

  // 播放器
  const [audioState, setAudioState] = useState<AudioPlayerState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    muted: false,
    seeking: false,
  });
  const playerRef = useRef<ReactPlayer | null>(null); // 播放器ref

  // 播放/暂停
  const handlePlayPause = () => {
    setAudioState(prev => ({ ...prev, playing: !prev.playing }));
  };

  // 进度条变化
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Radix Slider 的 value 是数组格式（支持多滑块），这里取第一个值
    const newValue = parseFloat(e.target.value);
    if (playerRef.current && !isNaN(newValue)) {
      setAudioState(prev => ({ ...prev, currentTime: newValue }));
    }
  };

  // 进度条拖动开始（补充鼠标事件类型）
  const handleSeekStart = (e: React.MouseEvent) => {
    setAudioState(prev => ({ ...prev, seeking: true }));
  };

  // 进度条拖动结束
  const handleSeekEnd = (e: React.MouseEvent) => {
    if (playerRef.current && !isNaN(audioState.currentTime)) {
      playerRef.current.seekTo(audioState.currentTime);
      setAudioState(prev => ({ ...prev, seeking: false }));
    }
  };

  // 快进10秒
  const handleForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(audioState.currentTime + 10);
    }
  };

  // 后退10秒
  const handleRewind = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(Math.max(audioState.currentTime - 10, 0));
    }
  };

  // 音量变化
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setAudioState(prev => ({ ...prev, volume: newVolume, muted: false }));
  };

  // 静音切换
  const handleMute = () => {
    setAudioState(prev => ({ ...prev, muted: !prev.muted }));
  };

  // 播放进度更新（来自ReactPlayer）
  const handleProgress = (progress: { played: number; playedSeconds: number; loaded: number }) => {
    if (!audioState.seeking) {
      setAudioState(prev => ({
        ...prev,
        currentTime: progress.playedSeconds,
        duration: progress.playedSeconds / progress.played || 0 // 初始duration为0的情况
      }));
    }
  };

  // 播放错误
  const handleError = (error: Error) => {
    toast.error(`音频播放失败：${error.message}`);
    setAudioState(prev => ({ ...prev, playing: false }));
  };

  // 清理音频URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl); // 释放资源
      }
    };
  }, [audioUrl]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">我的藏品</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleItemClick(item)}
          >
            <div className="aspect-square relative">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                于 {new Date(item.purchaseAt).toLocaleDateString()} 购入
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* 藏品详情页 */}
      <Dialog open={!!selectedItem} onOpenChange={() => {
        setSelectedItem(null);
        setAudioUrl(null); // 关闭对话框时停止播放
        setAudioState(prev => ({ ...prev, playing: false, currentTime: 0 }));
      }}>
        <DialogContent className="max-w-4xl min-h-[450px]"> {/* 自定义尺寸 */}
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {/* 藏品信息栏 */}
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="mt-2 text-gray-700">{selectedItem.description}</p>
                </div>
              </div>

              {/* 藏品音频播放器 */}
              <div className="flex flex-col justify-center">
                {audioUrl ? (
                  <div className="border rounded-lg p-4 bg-muted">
                    <ReactPlayer
                      ref={playerRef}
                      url={audioUrl}
                      playing={audioState.playing}
                      volume={audioState.volume}
                      muted={audioState.muted}
                      onProgress={handleProgress}
                      onError={handleError}
                      width="100%"
                      height="auto"
                      style={{ display: 'none' }} // 隐藏默认播放器 UI
                    />

                    {/* 自定义播放器控制界面 */}
                    <div className="flex flex-col gap-3">
                      {/* 进度条 */}
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-sm">
                          {new Date(audioState.currentTime * 1000).toISOString().substr(14, 5)}
                        </span>
                        <Slider
                          min={0}
                          max={audioState.duration}
                          value={[audioState.currentTime]} // 适配 Radix Slider 的数组格式
                          onMouseDown={handleSeekStart}
                          onChange={handleSeekChange}
                          onMouseUp={handleSeekEnd}
                          className="flex-1"
                        />
                        <span className="text-sm">
                          {new Date(audioState.duration * 1000).toISOString().substr(14, 5)}
                        </span>
                      </div>

                      {/* 播放控制按钮 */}
                      <div className="flex items-center justify-center gap-3">
                        <SkipBack onClick={handleRewind} />
                        <div onClick={handlePlayPause} >
                          {audioState.playing ? <Pause /> : <Play />}
                        </div>
                        <SkipForward onClick={handleForward} />
                      </div>

                      {/* 音量控制 */}
                      <div className="flex items-center justify-center gap-3">
                        <div onClick={handleMute}>
                          {audioState.muted ? <VolumeX /> : <Volume2 />}
                        </div>
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={[audioState.volume]} // 适配 Radix Slider 的数组格式
                          onChange={handleVolumeChange}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">加载音频中...</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
