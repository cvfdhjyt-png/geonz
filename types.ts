export enum PipelineStage {
  IDLE = 'IDLE',
  INGESTION = 'INGESTION',
  DECONSTRUCTION = 'DECONSTRUCTION',
  RECREATION = 'RECREATION',
  SYNTHESIS = 'SYNTHESIS',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  stage: PipelineStage;
}

export interface VideoMetadata {
  url: string;
  title: string;
  duration: number; // in seconds
  thumbnail?: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface RemixSegment {
  id: string;
  originalStart: number;
  originalEnd: number;
  originalText: string;
  newText: string;
  visualDescription: string;
  reasoning: string;
}

export interface ProjectState {
  id: string;
  status: PipelineStage;
  metadata: VideoMetadata | null;
  rawTranscript: TranscriptSegment[];
  remixPlan: RemixSegment[];
  logs: LogEntry[];
  progress: number;
}

export interface GeminiConfig {
  tone: string;
  targetDuration: string;
  platform: 'tiktok' | 'youtube_shorts' | 'instagram_reels';
}