import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

export const LogTerminal: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="bg-[#0b0f19] border border-gray-800 rounded-lg overflow-hidden flex flex-col h-64 md:h-full font-mono text-sm shadow-inner">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        <span className="ml-2 text-xs text-gray-500">pipeline_process.py (运行中)</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.length === 0 && (
          <div className="text-gray-600 italic">等待进程启动...</div>
        )}
        {logs.map((log, index) => (
          <div key={index} className="flex gap-3">
            <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
            <span
              className={`
                ${log.level === 'info' ? 'text-gray-300' : ''}
                ${log.level === 'success' ? 'text-green-400' : ''}
                ${log.level === 'warning' ? 'text-yellow-400' : ''}
                ${log.level === 'error' ? 'text-red-400' : ''}
              `}
            >
              <span className="opacity-50 mr-2 uppercase text-xs tracking-wider">[{log.stage}]</span>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};