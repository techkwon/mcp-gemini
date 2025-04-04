import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { logger } from '../utils/logger';
import config from '../config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// API 키를 환경 변수에서 가져옴
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  throw new Error('GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// 안정적인 Gemini Pro 모델 사용
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
});

// Gemini 1.5 Pro 모델 (이미지 생성 설명용)
const imageModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Gemini 2.0 Flash Experimental 모델 (이미지 생성용)
const imageGenerationModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp-image-generation",
});

// Gemini Pro Vision 모델 (이미지 분석용)
const visionModel = genAI.getGenerativeModel({
  model: "gemini-pro-vision",
});

// 기본 생성 설정
const defaultGenerationConfig = {
  temperature: 0.9,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048,
};

// 이미지 생성을 위한 설정
const imageGenerationConfig = {
  temperature: 0.8,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048,
};

// 유튜브 분석을 위한 설정
const youtubeGenerationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048,
};

// 확장된 타입 정의
// @ts-ignore: TypeScript 경고 무시
interface ExtendedPart {
  text?: string;
  fileData?: {
    mimeType: string;
    fileUri: string;
  };
}

// 옵션 타입 정의
interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  topK?: number;
  topP?: number;
}

// 이미지 생성 옵션 타입 정의
interface ImageGenerateOptions {
  resolution?: string;
  style?: string;
  quality?: 'standard' | 'hd';
  negative_prompt?: string;
  samples?: number;
  save_path?: string;
  temperature?: number;
}

// 이미지 편집 옵션 타입 정의
interface ImageEditOptions {
  style?: string;
  edit_prompt?: string;
  save_path?: string;
}

// 생성된 이미지 응답 타입
interface GeneratedImageResponse {
  imageBase64?: string;
  imagePath?: string;
  text?: string;
}

export const generateContent = async (prompt: string, options?: GenerateOptions): Promise<string> => {
  try {
    logger.info({ prompt }, '콘텐츠 생성 시작');
    
    // 생성 구성 설정
    const generationConfig = {
      ...defaultGenerationConfig,
      ...(options?.temperature !== undefined && { temperature: options.temperature }),
      ...(options?.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
      ...(options?.topK !== undefined && { topK: options.topK }),
      ...(options?.topP !== undefined && { topP: options.topP }),
    };
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const response = await result.response;
    logger.info('콘텐츠 생성 완료');
    return response.text();
  } catch (error) {
    logger.error('Gemini API 호출 중 오류:', error);
    throw new Error('콘텐츠 생성에 실패했습니다.');
  }
};

// 이미지 파일 저장 함수
const saveImage = async (imageData: string, savePath?: string): Promise<string> => {
  try {
    // 이미지 저장 경로 설정
    const uploadDir = savePath || path.join(process.cwd(), 'uploads');
    
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // 고유한 파일명 생성
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const imagePath = path.join(uploadDir, `generated_image_${uniqueId}.png`);
    
    // 이미지 데이터 저장
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(imagePath, buffer);
    
    logger.info(`이미지가 저장되었습니다: ${imagePath}`);
    return imagePath;
  } catch (error) {
    logger.error('이미지 저장 중 오류:', error);
    throw new Error('이미지 저장에 실패했습니다.');
  }
};

// 이미지 생성 함수 (실제 이미지 생성)
export const generateImage = async (prompt: string, options?: ImageGenerateOptions): Promise<GeneratedImageResponse> => {
  try {
    logger.info({ prompt }, '이미지 생성 시작');
    
    // 이미지 생성 설정
    const config = {
      ...imageGenerationConfig,
      ...(options?.temperature !== undefined && { temperature: options.temperature }),
    };
    
    // Gemini Pro Vision을 사용하여 이미지 설명 생성
    const result = await visionModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: config,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const response = await result.response;
    const description = response.text();
    
    // 이미지 생성은 현재 Gemini에서 직접 지원하지 않으므로,
    // 다른 이미지 생성 API를 사용하거나 사용자에게 안내 메시지를 제공
    logger.info('이미지 설명 생성 완료');
    return {
      text: `현재 Gemini API는 직접적인 이미지 생성을 지원하지 않습니다. 다음은 요청하신 이미지에 대한 설명입니다:\n\n${description}`,
    };
  } catch (error) {
    logger.error('이미지 생성 중 오류:', error);
    throw new Error('이미지 생성에 실패했습니다.');
  }
};

// 이미지 편집 함수
export const editImage = async (
  imageBase64: string, 
  prompt: string, 
  options?: ImageEditOptions
): Promise<GeneratedImageResponse> => {
  try {
    logger.info({ prompt }, '이미지 편집 시작');
    
    // 이미지를 base64에서 디코딩
    const imageData = Buffer.from(imageBase64, 'base64');
    
    // Gemini Pro Vision을 사용하여 이미지 분석 및 편집 설명 생성
    const result = await visionModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: imageGenerationConfig,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const response = await result.response;
    const editDescription = response.text();
    
    logger.info('이미지 편집 설명 생성 완료');
    return {
      text: `현재 Gemini API는 직접적인 이미지 편집을 지원하지 않습니다. 다음은 요청하신 편집에 대한 설명입니다:\n\n${editDescription}`,
      imageBase64: imageBase64  // 원본 이미지 반환
    };
  } catch (error) {
    logger.error('이미지 편집 중 오류:', error);
    throw new Error('이미지 편집에 실패했습니다.');
  }
};

export const geminiClient = {
  generateContent,
  generateImage,
  editImage,
  analyzeVideo: async (videoUrl: string, query: string): Promise<string> => {
    try {
      logger.info({ videoUrl, query }, '비디오 분석 시작');
      
      // NodeJS의 require를 사용하여 유튜브 분석 구현
      // 유튜브 비디오 분석을 위한 별도 함수 구현
      return await analyzeYouTubeVideoWithNodeCode(videoUrl, query);
    } catch (error) {
      logger.error({ error }, '비디오 분석 실패');
      
      // 오류 발생 시 기존 방식으로 대체
      try {
        logger.info('대체 방식으로 비디오 분석 시도');
        const videoId = extractYouTubeVideoId(videoUrl);
        const enhancedPrompt = `
          다음 유튜브 비디오에 대한 분석을 제공해주세요:
          비디오 ID: ${videoId}
          비디오 URL: ${videoUrl}
          
          분석 요청: ${query || '이 비디오에 대해 분석해주세요. 주요 내용, 핵심 포인트, 요약을 한국어로 알려주세요.'}
          
          다음 단계로 분석해주세요:
          1. 비디오의 제목과 채널 추정
          2. 비디오의 주요 내용 요약
          3. 주요 토픽과 키포인트
          4. 비디오의 목적과 대상 시청자층
          5. 종합적인 평가
          
          모든 정보를 한국어로 제공해주세요.
        `;
        
        const result = await generateContent(enhancedPrompt, { temperature: 0.3 });
        return result;
      } catch (backupError) {
        logger.error({ backupError }, '대체 비디오 분석 실패');
        throw new Error('비디오 분석에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  },
  searchWeb: async (query: string, options?: { limit?: number }): Promise<string> => {
    try {
      logger.info({ query, limit: options?.limit }, '웹 검색 시작');
      const limitText = options?.limit ? `상위 ${options.limit}개의 결과만 보여주세요.` : '';
      
      // 직접 generateContent 사용 (chatSession 대신)
      const searchPrompt = `
        다음 주제에 대해 인터넷에서 검색한 정보를 제공해주세요: "${query}"
        ${limitText}
        
        당신은 검색 엔진입니다. 다음 형식으로 결과를 제공해주세요:
        1. 검색 주제에 대한 간략한 개요 (2-3문장)
        2. 주요 정보 포인트 (글머리 기호 사용)
        3. 추가 상세 정보
        
        모든 응답은 한국어로 작성해주세요.
      `;
      
      // 수정된 옵션으로 직접 호출
      const generationConfig = {
        temperature: 0.3,
        maxOutputTokens: 2048,
        topP: 0.8,
        topK: 40
      };
      
      const configuredModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig
      });
      
      const result = await configuredModel.generateContent(searchPrompt);
      const responseText = await result.response.text();
      
      // 응답 텍스트 유효성 확인
      if (!responseText || responseText.trim() === '') {
        return '검색 결과를 찾을 수 없습니다. 다른 검색어로 시도해보세요.';
      }
      
      // 로그에 일부 결과만 기록
      logger.info(`웹 검색 완료: ${responseText.substring(0, 100)}...`);
      
      return responseText;
    } catch (error) {
      logger.error({ error }, '웹 검색 실패');
      throw new Error('웹 검색 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)));
    }
  },
  startChat: async (history: Array<{ role: string; content: string }> = [], options?: GenerateOptions): Promise<any> => {
    try {
      logger.info({ history, options }, '채팅 세션 시작');
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));
      
      // 생성 구성 설정
      const generationConfig = {
        ...defaultGenerationConfig,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(options?.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
        ...(options?.topK !== undefined && { topK: options.topK }),
        ...(options?.topP !== undefined && { topP: options.topP }),
      };

      return model.startChat({
        generationConfig,
        history: formattedHistory,
      });
    } catch (error) {
      logger.error({ error }, '채팅 세션 시작 실패');
      throw error;
    }
  }
};

// YouTube 비디오 ID 추출 함수
function extractYouTubeVideoId(url: string): string {
  try {
    // URL이 유효한지 확인
    const videoUrl = new URL(url);
    
    // youtube.com 또는 youtu.be 도메인인지 확인
    if (videoUrl.hostname.includes('youtube.com')) {
      // 정규 YouTube URL (예: https://www.youtube.com/watch?v=VIDEO_ID)
      const searchParams = new URLSearchParams(videoUrl.search);
      const videoId = searchParams.get('v');
      if (videoId) return videoId;
    } else if (videoUrl.hostname.includes('youtu.be')) {
      // 단축 URL (예: https://youtu.be/VIDEO_ID)
      const pathSegments = videoUrl.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) return pathSegments[0];
    }
    
    // ID를 찾지 못한 경우, URL 자체를 반환
    return url;
  } catch (e) {
    // URL 파싱 오류가 발생하면 원래 URL 반환
    return url;
  }
}

// YouTube 비디오 분석 함수 (Node.js 방식)
async function analyzeYouTubeVideoWithNodeCode(videoUrl: string, query: string): Promise<string> {
  try {
    logger.info('Node.js 코드로 YouTube 비디오 분석 시작');
    
    // TypeScript 문법 검사를 피하기 위해 js 파일을 동적으로 로드하는 함수 구현
    async function runYouTubeAnalysis() {
      try {
        // 임시 JS 파일을 생성하고 실행하는 대신, 직접 Gemini API 호출
        const GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
        });

        const generationConfig = {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        };

        // raw 형태의 history 객체 생성
        const history = [
          {
            role: "user",
            parts: [
              {
                fileData: {
                  mimeType: "video/*",
                  fileUri: videoUrl,
                },
              },
              {text: query || '이 비디오를 분석해주세요. 주요 내용, 핵심 포인트, 요약을 한국어로 알려주세요.'},
            ],
          },
        ];

        // @ts-ignore: TypeScript 타입 오류 무시
        const chatSession = model.startChat({
          generationConfig,
          history,
        });

        const result = await chatSession.sendMessage("비디오의 내용을 자세히 분석해주세요.");
        return result.response.text();
      } catch (nodeError) {
        logger.error({ nodeError }, 'Node.js 방식 비디오 분석 실패');
        throw nodeError;
      }
    }

    return await runYouTubeAnalysis();
  } catch (error) {
    logger.error({ error }, '비디오 분석 함수 실행 실패');
    throw error;
  }
}

export default generateContent; 