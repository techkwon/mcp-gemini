import dotenv from 'dotenv';
import { GenerationConfig } from '@google/generative-ai';

// 환경 변수 로드
dotenv.config();

export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  googleApiKey: string;
  logLevel: string;
  defaultConfig: GenerationConfig;
}

// 환경 변수 유효성 검사
const validateEnv = (): void => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is required');
  }
};

// 설정 객체 생성
export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '8000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  defaultConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
};

validateEnv();

export default config; 