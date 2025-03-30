import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const searchWeb = async (query: string): Promise<string> => {
  try {
    const prompt = `다음 주제에 대해 검색해주세요: ${query}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    logger.error('웹 검색 중 오류:', error);
    throw new Error('웹 검색에 실패했습니다.');
  }
};

export default searchWeb; 