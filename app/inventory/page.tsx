'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { InventoryService, InventoryItem as ApiInventoryItem } from '@/lib/inventory';

import ReactPlayer from 'react-player'; // 引入ReactPlayer
import { Slider } from '@/components/ui/slider'; // 使用项目UI库的滑块组件
import { Button } from '@/components/ui/button'; // 确保已导入Button

import { Play, Pause, SkipForward, SkipBack, VolumeX, Volume2 } from 'lucide-react';

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
  const [selectedItem, setSelectedItem] = useState<PageInventoryItem | null>(null);
  const [items, setItems] = useState<PageInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [audioState, setAudioState] = useState<AudioPlayerState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    muted: false,
    seeking: false,
  });
  const playerRef = useRef<ReactPlayer | null>(null); // 播放器ref

  // 处理播放/暂停
  const handlePlayPause = () => {
    setAudioState(prev => ({ ...prev, playing: !prev.playing }));
  };

  // 处理进度条拖动开始
  const handleSeekStart = () => {
    setAudioState(prev => ({ ...prev, seeking: true }));
  };

  // 处理进度条变化
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerRef.current && !isNaN(Number(e.target.value))) {
      setAudioState(prev => ({ ...prev, currentTime: Number(e.target.value) }));
    }
  };

  // 处理进度条拖动结束
  const handleSeekEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerRef.current &&!isNaN(Number(e.target.value))) {
      playerRef.current.seekTo(Number(e.target.value));
      setAudioState(prev => ({...prev, seeking: false }));
    }
  };

  // 处理快进10秒
  const handleForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(audioState.currentTime + 10);
    }
  };

  // 处理后退10秒
  const handleRewind = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(Math.max(audioState.currentTime - 10, 0));
    }
  };

  // 处理音量变化
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setAudioState(prev => ({ ...prev, volume: newVolume, muted: false }));
  };

  // 处理静音切换
  const handleMute = () => {
    setAudioState(prev => ({ ...prev, muted: !prev.muted }));
  };

  // 处理播放进度更新（来自ReactPlayer）
  const handleProgress = (progress: { played: number; playedSeconds: number; loaded: number }) => {
    if (!audioState.seeking) {
      setAudioState(prev => ({
        ...prev,
        currentTime: progress.playedSeconds,
        duration: progress.playedSeconds / progress.played || 0 // 处理初始duration为0的情况
      }));
    }
  };

  // 处理播放错误
  const handleError = (error: Error) => {
    toast.error(`音频播放失败：${error.message}`);
    setAudioState(prev => ({ ...prev, playing: false }));
  };

  // 获取藏品数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiItems = await InventoryService.getList();
        // 转换接口字段并补充流媒体文件名（示例假设文件名与productId一致）
        const pageItems = apiItems.map((item: ApiInventoryItem) => ({
          id: item.productId,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          purchaseAt: item.purchaseAt,
          streamFilename: `${item.productId}.m3u8` // 根据实际业务调整命名规则
        }));
        setItems(pageItems);
      } catch (error) {
        console.error('获取藏品失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // 清理音频URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl); // 释放资源
      }
    };
  }, [audioUrl]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">加载中...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl font-medium text-gray-800 mb-2">这里空空如也...</p>
          <p className="text-gray-500">快去挑选喜欢的商品，把它们加入你的藏品吧~</p>
        </div>
      </div>
    );
  }

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
                          type="range"
                          min={0}
                          max={audioState.duration}
                          value={[audioState.currentTime]} // 适配 Radix Slider 的数组格式
                          onMouseDown={handleSeekStart}
                          onChange={(e) => handleSeekChange(e)}
                          onMouseUp={handleSeekEnd}
                          className="flex-1"
                        />
                        <span className="text-sm">
                          {new Date(audioState.duration * 1000).toISOString().substr(14, 5)}
                        </span>
                      </div>

                      {/* 播放控制按钮 */}
                      <div className="flex items-center justify-center gap-3"> {/* 新增 justify-center 实现水平居中 */}
                        <SkipBack onClick={handleRewind} />
                        <div onClick={handlePlayPause} >
                          {audioState.playing? <Pause /> : <Play />}
                        </div>
                        <SkipForward onClick={handleForward} />
                      </div>
                      
                      {/* 音量控制 */}
                      <div className="flex items-center justify-center gap-3">
                        <div onClick={handleMute}>
                          {audioState.muted ? <VolumeX /> : <Volume2 />}
                        </div>
                        <Slider
                          type="range"
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
