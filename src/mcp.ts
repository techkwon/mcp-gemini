import { generateContent } from './api/gemini';
import { analyzeVideo, getVideoInfo } from './api/youtube';
import { searchWeb } from './api/google';

interface JsonRpcRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: any;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

type ToolFunction = (input: string) => Promise<string>;

interface Tools {
  [key: string]: ToolFunction;
}

const SUPPORTED_TOOLS: Tools = {
  'generate': generateContent,
  'analyze-video': async (input: string) => {
    try {
      const [videoUrl, query] = input.split('|');
      console.error(`비디오 분석 중: URL=${videoUrl}, 질문=${query}`);
      const videoInfo = await getVideoInfo(videoUrl);
      return await analyzeVideo(videoInfo, query);
    } catch (error) {
      console.error('비디오 분석 오류:', error);
      throw error;
    }
  },
  'search': searchWeb
};

export async function handleJsonRpcMessage(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  console.error(`메시지 수신: ${JSON.stringify(request)}`);

  if (request.method === 'initialize') {
    console.error('초기화 요청 처리 중');
    const response = {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        capabilities: {
          tools: Object.keys(SUPPORTED_TOOLS).map(name => ({
            name,
            description: `${name} 기능`,
            parameters: {
              type: 'object',
              properties: {
                input: { type: 'string' }
              },
              required: ['input']
            }
          }))
        }
      }
    };
    console.error(`초기화 응답: ${JSON.stringify(response)}`);
    return response;
  }

  if (request.method.startsWith('tools/')) {
    const toolName = request.params.name;
    console.error(`도구 호출: ${toolName}`);
    
    const tool = SUPPORTED_TOOLS[toolName];
    
    if (!tool) {
      console.error(`지원하지 않는 도구: ${toolName}`);
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Tool '${toolName}' not found`
        }
      };
    }

    try {
      console.error(`도구 실행 중: ${toolName}, 파라미터: ${JSON.stringify(request.params.parameters)}`);
      const result = await tool(request.params.parameters.input);
      console.error(`도구 실행 완료: ${toolName}`);
      
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        result: { output: result }
      };
      
      console.error(`도구 응답: ${JSON.stringify(response).substring(0, 100)}...`);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error(`도구 실행 오류: ${error.message}`);
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32000,
          message: 'Internal error',
          data: error.message
        }
      };
    }
  }

  console.error(`지원하지 않는 메서드: ${request.method}`);
  return null;
} 