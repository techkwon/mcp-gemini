import axios from 'axios';
import { logger } from '../utils/logger';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || '017576662512468239146:omuauf_lfve';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function searchWeb(query: string): Promise<string> {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: query
      }
    });

    const items = response.data.items as SearchResult[];
    if (!items || items.length === 0) {
      return '검색 결과가 없습니다.';
    }

    const results = items.slice(0, 5).map(item => {
      return `제목: ${item.title}\n링크: ${item.link}\n내용: ${item.snippet}\n`;
    }).join('\n');

    return results;
  } catch (error) {
    logger.error('웹 검색 실패', error);
    throw new Error('웹 검색 중 오류가 발생했습니다.');
  }
} 