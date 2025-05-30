import { useState } from 'react';
import { toast } from 'sonner';
import ReactPlayer from 'react-player'; // 新增：引入ReactPlayer


// 新增：音频播放器状态类型
type AudioPlayerState = {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  seeking: boolean;
};

export default function InventoryPage() {

}