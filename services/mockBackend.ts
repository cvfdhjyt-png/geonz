import { TranscriptSegment } from "../types";

// Mock data to simulate the "Download" and "ASR" phases without a real backend server
const MOCK_TRANSCRIPTS: Record<string, TranscriptSegment[]> = {
  "default": [
    { start: 0, end: 3.5, text: "大家好，欢迎回到频道。今天我们要深入研究这个新的 AI 智能体。" },
    { start: 3.5, end: 7.0, text: "说实话简直让人大开眼界。我从未见过本地运行速度能这么快的东西。" },
    { start: 7.0, end: 12.0, text: "等等，让我打开终端。看这个安装过程，这也太复杂了吧，全是报错。" },
    { start: 12.0, end: 15.5, text: "好吧，我搞砸了。忘了装依赖库。这就是我的日常。" },
    { start: 15.5, end: 20.0, text: "但一旦运行起来……哇。看这个实时生成的代码输出，丝般顺滑。" },
    { start: 20.0, end: 25.0, text: "我觉得这将彻底改变软件开发行业，很多初级工作要消失了。" },
    { start: 25.0, end: 30.0, text: "如果你喜欢这个硬核测评，别忘了大力点赞并订阅我的频道。" }
  ]
};

export const simulateDownload = (url: string): Promise<{ title: string; duration: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: "深度解析：下一代 AI Agent 原理与实测",
        duration: 184 // seconds
      });
    }, 2000); // Simulate network delay
  });
};

export const simulateFileUpload = (file: File): Promise<{ title: string; duration: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        duration: 120 // Mock duration for local files
      });
    }, 1500); // Simulate upload and probe time
  });
};

export const simulateTranscription = (source: string | File): Promise<TranscriptSegment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TRANSCRIPTS["default"]);
    }, 2500); // Simulate Whisper processing time
  });
};

export const simulateRendering = (): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("https://picsum.photos/seed/render/800/450");
        }, 3000); // Simulate FFmpeg rendering
    });
};