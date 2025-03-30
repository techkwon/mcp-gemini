import fastify, { FastifyInstance } from 'fastify';
import { logger } from './utils/logger';
import { generateContent } from './api/gemini';
import { getVideoInfo, analyzeVideo } from './api/youtube';
import { searchWeb } from './api/google';

export function createServer(): FastifyInstance {
  const server = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    }
  });

  // 헬스체크 엔드포인트
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  // 콘텐츠 생성 엔드포인트
  server.post('/generate', async (request, reply) => {
    const { prompt } = request.body as { prompt: string };
    logger.info('콘텐츠 생성 시작', { prompt });
    
    try {
      const result = await generateContent(prompt);
      logger.info('콘텐츠 생성 완료');
      return { result };
    } catch (error) {
      logger.error('콘텐츠 생성 실패', error);
      reply.status(500).send({ error: '콘텐츠 생성 중 오류가 발생했습니다.' });
    }
  });

  // 비디오 분석 엔드포인트
  server.post('/analyze-video', async (request, reply) => {
    const { videoUrl, query } = request.body as { videoUrl: string; query: string };
    logger.info('비디오 분석 시작', { videoUrl, query });
    
    try {
      const videoInfo = await getVideoInfo(videoUrl);
      const result = await analyzeVideo(videoInfo, query);
      logger.info('비디오 분석 완료');
      return { result };
    } catch (error) {
      logger.error('비디오 분석 실패', error);
      reply.status(500).send({ error: '비디오 분석 중 오류가 발생했습니다.' });
    }
  });

  // 웹 검색 엔드포인트
  server.post('/search', async (request, reply) => {
    const { query } = request.body as { query: string };
    logger.info('웹 검색 시작', { query });
    
    try {
      const result = await searchWeb(query);
      logger.info('웹 검색 완료');
      return { result };
    } catch (error) {
      logger.error('웹 검색 실패', error);
      reply.status(500).send({ error: '웹 검색 중 오류가 발생했습니다.' });
    }
  });

  return server;
} 