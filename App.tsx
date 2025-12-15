import React, { useState, useRef } from 'react';
import { 
  Play, 
  Settings, 
  Share2, 
  Github, 
  Wand2, 
  RotateCcw,
  FileVideo,
  AlertCircle,
  Download,
  Link as LinkIcon,
  UploadCloud,
  X
} from 'lucide-react';
import { 
  PipelineStage, 
  LogEntry, 
  VideoMetadata, 
  GeminiConfig, 
  RemixSegment 
} from './types';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { LogTerminal } from './components/LogTerminal';
import { ScriptEditor } from './components/ScriptEditor';
import { simulateDownload, simulateFileUpload, simulateTranscription, simulateRendering } from './services/mockBackend';
import { generateRemixScript, analyzeVideoContext } from './services/geminiService';

const DEFAULT_CONFIG: GeminiConfig = {
  tone: '幽默快节奏',
  targetDuration: '30',
  platform: 'tiktok'
};

export default function App() {
  // State
  const [inputMode, setInputMode] = useState<'link' | 'upload'>('link');
  const [urlInput, setUrlInput] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<PipelineStage>(PipelineStage.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<GeminiConfig>(DEFAULT_CONFIG);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [segments, setSegments] = useState<RemixSegment[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to add logs
  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      stage: stage 
    }]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartProcess = async () => {
    if (inputMode === 'link' && !urlInput) return;
    if (inputMode === 'upload' && !selectedFile) return;
    
    setIsProcessing(true);
    setLogs([]); // Clear logs
    setSegments([]);
    setFinalVideoUrl(null);
    setStage(PipelineStage.INGESTION);
    
    // 1. INGESTION
    let meta: { title: string; duration: number };
    let currentUrl: string;

    try {
      if (inputMode === 'link') {
        addLog(`开始获取素材: ${urlInput}`, 'info');
        addLog('启动进程: yt-dlp --format bestvideo+bestaudio', 'info');
        meta = await simulateDownload(urlInput);
        currentUrl = urlInput;
      } else {
        addLog(`正在上传本地文件: ${selectedFile?.name}`, 'info');
        addLog(`文件大小: ${(selectedFile!.size / 1024 / 1024).toFixed(2)} MB`, 'info');
        meta = await simulateFileUpload(selectedFile!);
        currentUrl = URL.createObjectURL(selectedFile!);
      }
      
      setVideoData({
        ...meta,
        url: currentUrl
      });
      addLog(`预处理完成: ${meta.title} (${meta.duration}秒)`, 'success');
      
      // 2. DECONSTRUCTION
      setStage(PipelineStage.DECONSTRUCTION);
      addLog('正在提取音轨...', 'info');
      addLog('运行 OpenAI Whisper (Large-v3)...', 'info');
      
      const transcript = await simulateTranscription(inputMode === 'link' ? urlInput : selectedFile!);
      addLog(`转录完成。提取了 ${transcript.length} 个片段。`, 'success');
      
      addLog('正在运行 Gemini 视觉分析关键帧...', 'info');
      const analysis = await analyzeVideoContext(meta.title, "Tech review video");
      addLog(`视觉语境: ${analysis.join(', ')}`, 'info');

      // 3. RE-CREATION
      setStage(PipelineStage.RECREATION);
      addLog('初始化 LLM 智能体 (Gemini 2.5)...', 'info');
      addLog(`上下文已加载: ${transcript.length} 个文本片段 + 视觉数据。`, 'info');
      addLog(`设定风格: ${config.tone}`, 'info');

      const remixPlan = await generateRemixScript(transcript, config);
      setSegments(remixPlan);
      addLog(`二创方案已生成: 识别出 ${remixPlan.length} 个剪辑片段。`, 'success');

      // 4. SYNTHESIS
      setStage(PipelineStage.SYNTHESIS);
      addLog('生成语音 (Edge-TTS)...', 'info');
      addLog('计算时间轴偏移...', 'info');
      addLog('生成 FFmpeg EDL (剪辑决策列表)...', 'info');
      
      const renderUrl = await simulateRendering();
      setFinalVideoUrl(renderUrl);
      
      // 5. COMPLETE
      setStage(PipelineStage.COMPLETE);
      addLog('渲染完成。输出已保存至 /dist/output.mp4', 'success');
      addLog('工作流执行成功。', 'success');

    } catch (err: any) {
      setStage(PipelineStage.ERROR);
      addLog(`错误: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStage(PipelineStage.IDLE);
    setLogs([]);
    setSegments([]);
    setVideoData(null);
    setFinalVideoUrl(null);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0b0f19] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wand2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">AutoRemix Studio</h1>
              <p className="text-xs text-gray-400">AI 驱动的自动化视频二创工作流</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <a href="#" className="text-gray-400 hover:text-white transition-colors">文档</a>
             <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
               <Github size={18} />
               <span>GitHub</span>
             </a>
             <button className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm border border-gray-700">
               登录
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls & Visualizer */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Input Section */}
          <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold flex items-center gap-2">
                 <FileVideo className="text-blue-400" /> 原始素材
               </h2>
               {stage !== PipelineStage.IDLE && (
                 <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                   <RotateCcw size={12} /> 重置工作流
                 </button>
               )}
            </div>
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700 mb-6">
              <button 
                onClick={() => !isProcessing && setInputMode('link')}
                className={`pb-2 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${inputMode === 'link' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <LinkIcon size={16} /> 视频链接
              </button>
              <button 
                onClick={() => !isProcessing && setInputMode('upload')}
                className={`pb-2 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${inputMode === 'upload' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <UploadCloud size={16} /> 本地上传
              </button>
            </div>
            
            <div className="flex flex-col gap-4 mb-6">
              
              {/* Input: URL Mode */}
              {inputMode === 'link' && (
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isProcessing || stage !== PipelineStage.IDLE}
                    placeholder="粘贴 YouTube, Bilibili 或 TikTok 链接..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-200"
                  />
                </div>
              )}

              {/* Input: Upload Mode */}
              {inputMode === 'upload' && (
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative
                    ${selectedFile ? 'border-blue-500/50 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'}
                  `}
                  onClick={() => stage === PipelineStage.IDLE && fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={isProcessing || stage !== PipelineStage.IDLE}
                  />
                  
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileVideo size={32} className="text-blue-400 mb-2" />
                      <p className="text-sm font-medium text-blue-200">{selectedFile.name}</p>
                      <p className="text-xs text-blue-300/60 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      {stage === PipelineStage.IDLE && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full"
                         >
                            <X size={16} className="text-gray-400" />
                         </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2">
                      <UploadCloud size={32} className="text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400">点击或拖拽视频文件至此</p>
                      <p className="text-xs text-gray-600 mt-1">支持 MP4, MOV, MKV (Max 500MB)</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button 
                onClick={handleStartProcess}
                disabled={isProcessing || stage !== PipelineStage.IDLE || (inputMode === 'link' && !urlInput) || (inputMode === 'upload' && !selectedFile)}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg
                  ${isProcessing || stage !== PipelineStage.IDLE || (inputMode === 'link' && !urlInput) || (inputMode === 'upload' && !selectedFile)
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20'
                  }`}
              >
                {isProcessing ? (
                  <>处理中...</>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" /> 启动二创工作流
                  </>
                )}
              </button>
            </div>

            {/* Config Quick Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                 <label className="text-xs text-gray-500 block mb-1">风格/语气</label>
                 <select 
                    value={config.tone}
                    onChange={(e) => setConfig({...config, tone: e.target.value})}
                    disabled={stage !== PipelineStage.IDLE}
                    className="w-full bg-transparent text-sm text-gray-200 outline-none border-none p-0 focus:ring-0"
                 >
                   <option>幽默快节奏</option>
                   <option>史诗电影感</option>
                   <option>知识科普/冷静</option>
                   <option>毒舌吐槽</option>
                 </select>
               </div>
               <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                 <label className="text-xs text-gray-500 block mb-1">目标时长</label>
                 <select 
                    value={config.targetDuration}
                    onChange={(e) => setConfig({...config, targetDuration: e.target.value})}
                    disabled={stage !== PipelineStage.IDLE}
                    className="w-full bg-transparent text-sm text-gray-200 outline-none border-none p-0 focus:ring-0"
                 >
                   <option value="15">15 秒 (朋友圈/Story)</option>
                   <option value="30">30 秒 (短视频)</option>
                   <option value="60">60 秒 (中视频)</option>
                 </select>
               </div>
               <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                 <label className="text-xs text-gray-500 block mb-1">输出格式</label>
                 <div className="text-sm text-gray-200">9:16 竖屏</div>
               </div>
            </div>
          </div>

          {/* Pipeline Visualization */}
          <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pipeline 状态</h3>
            <PipelineVisualizer currentStage={stage} />
          </div>

          {/* Log Terminal */}
          <div className="h-96">
            <LogTerminal logs={logs} />
          </div>
        </div>

        {/* Right Column: Editor & Result */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Output Preview */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden flex flex-col h-[400px]">
             <div className="p-4 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
               <h3 className="font-semibold text-gray-200">实时预览</h3>
               <div className="flex gap-2">
                 <button className="p-1.5 hover:bg-gray-800 rounded text-gray-400"><Settings size={16} /></button>
                 <button className="p-1.5 hover:bg-gray-800 rounded text-gray-400"><Share2 size={16} /></button>
               </div>
             </div>
             
             <div className="flex-1 bg-black relative flex items-center justify-center">
               {finalVideoUrl ? (
                 <div className="relative w-full h-full group">
                   <img src={finalVideoUrl} alt="Result" className="w-full h-full object-cover opacity-80" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full hover:scale-110 transition-transform cursor-pointer">
                        <Play size={32} className="text-white fill-white" />
                     </div>
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 flex justify-between items-center">
                      <p className="text-xs text-gray-300">Generated via FFmpeg • 1080p • 30fps</p>
                      <a 
                        href={finalVideoUrl} 
                        download="auto_remix_output.mp4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-lg shadow-blue-900/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={14} />
                        下载视频
                      </a>
                   </div>
                 </div>
               ) : (
                 <div className="text-center text-gray-600">
                   {stage === PipelineStage.SYNTHESIS ? (
                     <div className="animate-pulse flex flex-col items-center">
                       <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p>正在渲染视频...</p>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center">
                       <FileVideo size={48} className="mb-2 opacity-20" />
                       <p>等待合成...</p>
                     </div>
                   )}
                 </div>
               )}
             </div>
          </div>

          {/* Script Editor (Only visible if we have data) */}
          {segments.length > 0 && (
             <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700 h-[500px] overflow-y-auto custom-scrollbar">
                <ScriptEditor 
                  segments={segments} 
                  onUpdate={setSegments} 
                  readOnly={stage === PipelineStage.SYNTHESIS || stage === PipelineStage.COMPLETE}
                />
             </div>
          )}

          {/* Placeholder for when no script yet */}
          {segments.length === 0 && (
            <div className="bg-[#1e293b] rounded-xl p-8 border border-dashed border-gray-700 flex flex-col items-center justify-center text-center h-[200px] text-gray-500">
               <AlertCircle size={32} className="mb-3 opacity-50" />
               <p className="text-sm">等待脚本生成...</p>
               <p className="text-xs mt-1 max-w-xs opacity-60">AI 智能体将在解构阶段完成后，在此处输出结构化的剪辑决策列表 (EDL)。</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}