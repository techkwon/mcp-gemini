import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateContent, generateImage, editImage, geminiClient } from './api/gemini';
import { getVideoInfo, analyzeVideo } from './api/youtube';
import fs from 'fs';
import path from 'path';

// 디버그 로그 활성화
console.error('MCP 서버 시작 중...');

// MCP 서버 인스턴스 생성
const server = new McpServer({
  name: "gemini-mcp",
  version: "1.0.0"
});

// =========================================
// 도구(Tool) 기능 구현
// =========================================

// 도구 등록: 텍스트 생성
server.tool(
  "gem-generate",
  { 
    input: z.string().describe("생성할 텍스트 입력"), 
    options: z.object({
      temperature: z.number().min(0).max(1).default(0.7).optional().describe("생성 온도(0-1)"),
      maxTokens: z.number().min(1).max(2048).optional().describe("최대 토큰 수")
    }).optional()
  },
  async ({ input, options }) => {
    console.error('텍스트 생성 시작:', input, '옵션:', options);
    try {
      const result = await generateContent(input, options);
      console.error('텍스트 생성 완료');
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error: unknown) {
      console.error('텍스트 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      return {
        content: [{ type: "text", text: `오류: ${errorMessage}` }],
        isError: true
      };
    }
  }
);

// 도구 등록: 비디오 분석
server.tool(
  "gem-analyze-video",
  { 
    videoUrl: z.string().describe("분석할 YouTube 비디오 URL"),
    query: z.string().optional().describe("분석을 위한 특정 질문(선택사항)")
  },
  async ({ videoUrl, query }) => {
    console.error('비디오 분석 시작:', videoUrl, '질문:', query);
    try {
      const videoInfo = await getVideoInfo(videoUrl);
      const result = await analyzeVideo(videoInfo, query || '');
      console.error('비디오 분석 완료');
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error: unknown) {
      console.error('비디오 분석 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      return {
        content: [{ type: "text", text: `오류: ${errorMessage}` }],
        isError: true
      };
    }
  }
);

// 도구 등록: 웹 검색
server.tool(
  "gem-search",
  { 
    query: z.string().describe("검색 쿼리"),
    limit: z.number().min(1).max(10).default(5).optional().describe("결과 수 제한")
  },
  async ({ query, limit }) => {
    console.error('웹 검색 시작:', query, '결과 제한:', limit);
    try {
      const result = await geminiClient.searchWeb(query, { limit });
      console.error('웹 검색 완료');
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error: unknown) {
      console.error('웹 검색 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      return {
        content: [{ type: "text", text: `오류: ${errorMessage}` }],
        isError: true
      };
    }
  }
);

// 도구 등록: 이미지 생성
server.tool(
  "gem-generate-image",
  {
    prompt: z.string().describe("이미지 생성 프롬프트"),
    options: z.object({
      style: z.string().optional().describe("이미지 스타일 (예: '사실적', '만화', '유화', '수채화', '픽셀아트' 등)"),
      resolution: z.string().optional().describe("이미지 해상도 (예: '1024x1024', '512x512' 등)"),
      quality: z.enum(['standard', 'hd']).optional().describe("이미지 품질 (standard 또는 hd)"),
      negative_prompt: z.string().optional().describe("이미지에 포함하지 않을 요소"),
      temperature: z.number().optional().describe("생성 온도 (0.0-1.0)")
    }).optional()
  },
  async ({ prompt, options }) => {
    console.error('이미지 생성 시작:', prompt, '옵션:', options);
    try {
      const result = await generateImage(prompt, options);
      console.error('이미지 생성 완료', typeof result, result);
      
      // 이미지 데이터가 있는 경우
      if (result.imageBase64) {
        return {
          content: [
            { type: "text", text: result.text || '이미지가 생성되었습니다.' },
            { type: "image", data: result.imageBase64, mimeType: "image/png" }
          ]
        };
      } 
      // 텍스트만 있는 경우
      else {
        return {
          content: [{ type: "text", text: result.text || '이미지를 생성할 수 없습니다.' }]
        };
      }
    } catch (error: unknown) {
      console.error('이미지 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      return {
        content: [{ type: "text", text: `오류: ${errorMessage}` }],
        isError: true
      };
    }
  }
);

// 도구 등록: 이미지 편집
server.tool(
  "gem-edit-image",
  {
    imageBase64: z.string().describe("편집할 이미지의 Base64 인코딩 데이터"),
    prompt: z.string().describe("이미지 편집 지시사항"),
    options: z.object({
      style: z.string().optional().describe("편집 스타일 (예: '사실적', '만화', '유화', '수채화' 등)"),
      save_path: z.string().optional().describe("이미지 저장 경로")
    }).optional()
  },
  async ({ imageBase64, prompt, options }) => {
    console.error('이미지 편집 시작:', prompt, '옵션:', options);
    try {
      const result = await editImage(imageBase64, prompt, options);
      console.error('이미지 편집 완료', typeof result, result);
      
      // 이미지 데이터가 있는 경우
      if (result.imageBase64) {
        return {
          content: [
            { type: "text", text: result.text || '이미지가 편집되었습니다.' },
            { type: "image", data: result.imageBase64, mimeType: "image/png" }
          ]
        };
      } 
      // 텍스트만 있는 경우
      else {
        return {
          content: [{ type: "text", text: result.text || '이미지를 편집할 수 없습니다.' }]
        };
      }
    } catch (error: unknown) {
      console.error('이미지 편집 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      return {
        content: [{ type: "text", text: `오류: ${errorMessage}` }],
        isError: true
      };
    }
  }
);

// =========================================
// 리소스(Resource) 기능 구현
// =========================================

// 리소스 등록: 도움말
server.resource(
  "help",
  "help://main",
  async (uri) => {
    console.error('도움말 리소스 요청:', uri.href);
    return {
      contents: [{
        uri: uri.href,
        text: `# Gemini MCP 도움말

## 사용 가능한 도구
- \`gem-generate\`: Gemini를 사용한 텍스트 생성
- \`gem-analyze-video\`: YouTube 비디오 분석
- \`gem-search\`: 웹 검색
- \`gem-generate-image\`: 이미지 생성
- \`gem-edit-image\`: 이미지 편집

## 사용 가능한 리소스
- \`help://main\`: 이 도움말
- \`examples://tools\`: 도구 사용 예제
- \`docs://{topic}\`: 특정 주제에 대한 문서`
      }]
    };
  }
);

// 리소스 등록: 도구 예제
server.resource(
  "examples",
  "examples://tools",
  async (uri) => {
    console.error('예제 리소스 요청:', uri.href);
    return {
      contents: [{
        uri: uri.href,
        text: `# 도구 사용 예제

## 텍스트 생성 예제
\`\`\`json
{
  "name": "gem-generate",
  "arguments": {
    "input": "한국의 역사에 대해 요약해 주세요",
    "options": {
      "temperature": 0.5,
      "maxTokens": 1000
    }
  }
}
\`\`\`

## 비디오 분석 예제
\`\`\`json
{
  "name": "gem-analyze-video",
  "arguments": {
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "query": "이 비디오의 주요 내용은 무엇인가요?"
  }
}
\`\`\`

## 웹 검색 예제
\`\`\`json
{
  "name": "gem-search",
  "arguments": {
    "query": "최신 인공지능 기술 트렌드",
    "limit": 3
  }
}
\`\`\`

## 이미지 생성 예제
\`\`\`json
{
  "name": "gem-generate-image",
  "arguments": {
    "prompt": "한국의 전통 한옥과 벚꽃이 있는 풍경",
    "options": {
      "style": "수채화",
      "resolution": "1024x1024",
      "quality": "hd",
      "temperature": 0.8
    }
  }
}
\`\`\`

## 이미지 편집 예제
\`\`\`json
{
  "name": "gem-edit-image",
  "arguments": {
    "imageBase64": "[base64 인코딩된 이미지 데이터]",
    "prompt": "이미지에 눈 내리는 효과를 추가해주세요",
    "options": {
      "style": "사실적"
    }
  }
}
\`\`\`
`
      }]
    };
  }
);

// 리소스 등록: 문서
server.resource(
  "docs",
  new ResourceTemplate("docs://{topic}", { list: undefined }),
  async (uri, { topic }) => {
    console.error('문서 리소스 요청:', uri.href, '주제:', topic);
    let docText: string;
    
    switch (topic) {
      case 'gemini':
        docText = `# Gemini API 사용 가이드

Gemini는 Google의 최신 대규모 언어 모델로, 다양한 텍스트 생성 및 처리 작업을 수행할 수 있습니다.

## 주요 기능
- 텍스트 생성 및 완성
- 대화형 상호작용
- 코드 생성 및 분석
- 다양한 언어 지원

## 매개변수
- temperature: 생성의 무작위성 제어 (0.0-1.0)
- maxTokens: 생성할 최대 토큰 수
- topP: 확률 분포의 상위 p% 중에서 토큰 선택
- topK: 확률 분포의 상위 K개 토큰 중에서 선택`;
        break;
      case 'youtube':
        docText = `# YouTube 분석 API 가이드

YouTube 비디오를 분석하여 내용, 주제, 요약 등의 정보를 추출합니다.

## 지원 기능
- 비디오 메타데이터 추출
- 자막 기반 내용 분석
- 주요 주제 추출
- 질문에 대한 답변 생성

## 사용 방법
1. 유효한 YouTube URL 제공
2. 필요한 경우 특정 질문 추가
3. 결과 확인`;
        break;
      case 'search':
        docText = `# 웹 검색 API 가이드

Google 검색 엔진을 통해 웹 검색을 수행하고 결과를 반환합니다.

## 주요 기능
- 다양한 주제에 대한 검색
- 최신 정보 검색
- 여러 소스의 정보 통합

## 매개변수
- query: 검색할 쿼리
- limit: 반환할 결과 수 (기본값: 5)`;
        break;
      case 'image':
        docText = `# 이미지 생성 및 편집 API 가이드

## 이미지 생성 API
텍스트 프롬프트를 기반으로 이미지를 생성합니다.

### 주요 기능
- 텍스트 프롬프트 기반 이미지 생성
- 다양한 스타일 및 해상도 지원
- 실제 이미지 생성 및 Base64 인코딩 데이터 제공

### 매개변수
- prompt: 이미지를 설명하는 텍스트 프롬프트
- style: 이미지 스타일 (사실적, 만화, 유화 등)
- resolution: 이미지 해상도
- quality: 이미지 품질 (standard 또는 hd)
- temperature: 생성 온도 (0.0-1.0)

## 이미지 편집 API
기존 이미지를 텍스트 프롬프트에 따라 편집합니다.

### 주요 기능
- 기존 이미지 수정 및 변환
- 텍스트 프롬프트를 통한 편집 지시
- 다양한 편집 스타일 지원

### 매개변수
- imageBase64: 편집할 Base64 인코딩 이미지 데이터
- prompt: 편집 지시사항
- style: 편집 스타일`;
        break;
      default:
        docText = `# 문서를 찾을 수 없음

요청하신 주제 '${topic}'에 대한 문서를 찾을 수 없습니다.
사용 가능한 문서 주제:
- gemini
- youtube
- search
- image`;
    }
    
    return {
      contents: [{
        uri: uri.href,
        text: docText
      }]
    };
  }
);

// 에러 처리 설정
process.on('uncaughtException', (error: Error) => {
  console.error('처리되지 않은 예외:', error);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('처리되지 않은 Promise 거부:', reason);
});

// 서버 실행
async function main() {
  try {
    // stdio 트랜스포트 생성 및 연결
    const transport = new StdioServerTransport();
    
    console.error('MCP 서버가 준비되었습니다. 메시지 수신 대기 중...');
    await server.connect(transport);
  } catch (error) {
    console.error('MCP 서버 실행 중 오류:', error);
    process.exit(1);
  }
}

// 메인 함수 실행
main().catch(error => {
  console.error('치명적인 오류:', error);
  process.exit(1);
});