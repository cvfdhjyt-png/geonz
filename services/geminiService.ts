import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptSegment, RemixSegment, GeminiConfig } from "../types";

// Initialize Gemini Client
// Note: In a real production app, this should be proxied through a backend to protect the key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRemixScript = async (
  transcript: TranscriptSegment[],
  config: GeminiConfig
): Promise<RemixSegment[]> => {
  
  const transcriptText = transcript.map(t => `[${t.start.toFixed(1)}s - ${t.end.toFixed(1)}s]: ${t.text}`).join("\n");

  const prompt = `
    你是一位专业的短视频剪辑师和脚本作家，擅长制作病毒式传播的爆款视频。
    
    任务：将以下视频逐字稿改编成一段 ${config.targetDuration} 秒的脚本，适用于 ${config.platform} 平台。
    风格/语气：${config.tone}。
    
    指令：
    1. 挑选逐字稿中最吸引人的部分。
    2. 将口语文本改写得更简练、更有梗或更具戏剧性（根据风格而定）。
    3. 保持 "newText" 的长度与原片段时长大致匹配，或者稍微短一点以加快节奏。
    4. 提供视觉描述（visualDescription），说明画面应该发生什么（或是否需要 B-Roll 素材）。
    5. 解释你选择这个片段的理由（reasoning）。
    6. **所有输出字段（newText, visualDescription, reasoning）必须使用简体中文。**

    输入逐字稿：
    ${transcriptText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              originalStart: { type: Type.NUMBER },
              originalEnd: { type: Type.NUMBER },
              originalText: { type: Type.STRING },
              newText: { type: Type.STRING },
              visualDescription: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            },
            required: ["id", "originalStart", "originalEnd", "newText", "visualDescription"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as RemixSegment[];
    }
    throw new Error("Gemini 返回了空响应");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeVideoContext = async (title: string, description: string) => {
    // This is a placeholder for a more complex "Deconstruction" phase 
    // where we might send frames to Gemini Pro Vision.
    // For this demo, we just get a strategic summary.
    
    const prompt = `
      分析这个视频主题，以便进行二次创作。
      标题: ${title}
      描述: ${description}
      
      请建议 3 个能让视频在 TikTok/抖音 上爆火的切入角度。
      请以简体中文输出一个 JSON 字符串数组。
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        return ["聚焦搞笑片段", "加快节奏", "添加表情包音效"];
    }
};