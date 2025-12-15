import React from 'react';
import { RemixSegment } from '../types';
import { Edit3, Clock, Video, Eye, MessageSquare } from 'lucide-react';

interface Props {
  segments: RemixSegment[];
  onUpdate: (segments: RemixSegment[]) => void;
  readOnly?: boolean;
}

export const ScriptEditor: React.FC<Props> = ({ segments, onUpdate, readOnly = false }) => {
  
  const handleTextChange = (id: string, newText: string) => {
    if (readOnly) return;
    const updated = segments.map(s => 
      s.id === id ? { ...s, newText } : s
    );
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Edit3 size={18} className="text-blue-400" />
          AI 脚本编辑器 (EDL 预览)
        </h3>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">
          已生成 {segments.length} 个片段
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {segments.map((segment) => (
          <div 
            key={segment.id} 
            className="bg-gray-900/50 border border-gray-700 hover:border-blue-500/50 transition-colors rounded-lg p-4 group"
          >
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Metadata & Source */}
              <div className="md:w-1/4 space-y-2 border-b md:border-b-0 md:border-r border-gray-800 pb-2 md:pb-0 md:pr-4">
                <div className="flex items-center gap-2 text-xs text-blue-300 font-mono bg-blue-900/20 w-fit px-2 py-0.5 rounded">
                  <Clock size={12} />
                  {segment.originalStart.toFixed(1)}s - {segment.originalEnd.toFixed(1)}s
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-400 block mb-1">原音文案:</span>
                  "{segment.originalText}"
                </div>
                <div className="text-xs text-purple-300/80 mt-2 flex gap-1">
                   <Eye size={12} className="mt-0.5" /> 
                   <span className="italic">{segment.reasoning}</span>
                </div>
              </div>

              {/* Editor Area */}
              <div className="md:w-3/4 space-y-3">
                
                {/* Visual Cue */}
                <div className="flex items-start gap-2 text-sm text-green-300/80 bg-green-900/10 p-2 rounded border border-green-900/30">
                  <Video size={16} className="mt-0.5 shrink-0" />
                  <span className="italic text-xs md:text-sm">画面建议: {segment.visualDescription}</span>
                </div>

                {/* Text Input */}
                <div className="relative">
                  <label className="text-xs text-gray-400 absolute -top-2.5 left-2 bg-[#0f172a] px-1">二创脚本 (TTS)</label>
                  <textarea
                    value={segment.newText}
                    onChange={(e) => handleTextChange(segment.id, e.target.value)}
                    disabled={readOnly}
                    className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm min-h-[80px] font-medium"
                  />
                  <MessageSquare size={14} className="absolute bottom-3 right-3 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};