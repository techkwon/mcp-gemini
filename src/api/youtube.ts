import { google } from 'googleapis';
import { logger } from '../utils/logger';

const youtube = google.youtube('v3');

export const getVideoInfo = async (videoUrl: string) => {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('유효하지 않은 YouTube URL입니다.');
    }

    const response = await youtube.videos.list({
      key: process.env.GOOGLE_API_KEY,
      part: ['snippet', 'contentDetails'],
      id: [videoId],
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('비디오를 찾을 수 없습니다.');
    }

    const video = response.data.items[0];
    return {
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      duration: video.contentDetails?.duration || '',
      publishedAt: video.snippet?.publishedAt || '',
      channelTitle: video.snippet?.channelTitle || '',
    };
  } catch (error) {
    logger.error('YouTube API 호출 중 오류 발생:', error);
    throw error;
  }
};

const extractVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const analyzeVideo = async (videoInfo: any, query: string) => {
  try {
    const prompt = `
      다음 YouTube 비디오에 대해 답변해주세요:
      제목: ${videoInfo.title}
      채널: ${videoInfo.channelTitle}
      설명: ${videoInfo.description}
      게시일: ${videoInfo.publishedAt}
      길이: ${videoInfo.duration}

      질문: ${query}
    `;

    // TODO: Gemini API를 사용하여 비디오 분석
    return '비디오 분석 결과...';
  } catch (error) {
    logger.error('비디오 분석 중 오류 발생:', error);
    throw error;
  }
}; 