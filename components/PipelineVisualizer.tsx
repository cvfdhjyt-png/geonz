import React from 'react';
import { PipelineStage } from '../types';
import { Download, Layers, Sparkles, Film, FileAudio } from 'lucide-react';

interface Props {
  currentStage: PipelineStage;
}

const steps = [
  { id: PipelineStage.INGESTION, label: '素材获取', icon: Download, desc: 'yt-dlp 下载' },
  { id: PipelineStage.DECONSTRUCTION, label: '深度解构', icon: Layers, desc: 'Whisper 语音识别 & 视觉分析' },
  { id: PipelineStage.RECREATION, label: '创意重构', icon: Sparkles, desc: 'LLM 脚本二创' },
  { id: PipelineStage.SYNTHESIS, label: '合成渲染', icon: FileAudio, desc: 'TTS 配音 & 剪辑' },
  { id: PipelineStage.COMPLETE, label: '最终成片', icon: Film, desc: '渲染输出' },
];

export const PipelineVisualizer: React.FC<Props> = ({ currentStage }) => {
  const getStepStatus = (stepId: PipelineStage, current: PipelineStage) => {
    const order = [
      PipelineStage.IDLE,
      PipelineStage.INGESTION,
      PipelineStage.DECONSTRUCTION,
      PipelineStage.RECREATION,
      PipelineStage.SYNTHESIS,
      PipelineStage.COMPLETE
    ];
    const currentIndex = order.indexOf(current);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-10 transform -translate-y-1/2 rounded"></div>
        <div 
            className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 transform -translate-y-1/2 rounded transition-all duration-500 ease-out"
            style={{ width: `${(Math.max(0, steps.findIndex(s => s.id === currentStage))) * 25}%` }}
        ></div>

        {steps.map((step) => {
          const status = getStepStatus(step.id, currentStage);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center group">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 
                  ${status === 'completed' ? 'bg-blue-900 border-blue-500 text-blue-200' : ''}
                  ${status === 'active' ? 'bg-blue-600 border-white text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110' : ''}
                  ${status === 'pending' ? 'bg-gray-900 border-gray-700 text-gray-500' : ''}
                `}
              >
                <Icon size={20} />
              </div>
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold ${status === 'active' ? 'text-blue-400' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden md:block">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};