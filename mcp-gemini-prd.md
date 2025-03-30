# MCP Gemini 서버 구축 PRD (Product Requirements Document)

## 1. 개요

Model Context Protocol(MCP) 기반으로 Google의 Gemini API를 활용한 서버를 구축하여 이미지 생성, 유튜브 분석, 구글 검색 등의 다양한 기능을 제공하는 시스템입니다. 이 서버는 Claude를 비롯한 다양한 MCP 클라이언트와 통합되어 확장된 AI 기능을 제공합니다.

## 2. 배경 및 목적

MCP(Model Context Protocol)는 Anthropic이 주도하여 개발한 개방형 표준으로, AI 모델이 외부 데이터 소스 및 도구와 안전하게 상호작용할 수 있는 표준화된 방법을 제공합니다. MCP는 "AI 애플리케이션을 위한 USB-C 포트"로 비유되며, 다양한 AI 시스템들이 일관된 방식으로 외부 도구와 통합될 수 있도록 합니다.

본 프로젝트의 목적은:
1. Google의 Gemini API를 MCP 표준에 맞춰 통합하여 Claude와 같은 MCP 클라이언트에서 Gemini 모델의 기능을 활용할 수 있게 하는 것입니다.
2. 이미지 생성, 유튜브 분석, 구글 검색 기능을 MCP 프로토콜을 통해 제공하는 것입니다.
3. Node.js 기반으로 확장 가능하고 유지보수가 쉬운 MCP 서버를 구축하는 것입니다.

## 3. 주요 기능 요구사항

### 3.1 MCP 서버 기본 기능
- MCP 프로토콜 v1.0 완전 지원
- 모든 필수 엔드포인트 구현 (list-tools, invoke-tool, get-tool-spec)
- 보안 연결 및 인증 처리
- 오류 처리 및 로깅
- 도구 호출 응답 시간 최적화

### 3.2 Gemini API 통합
- Google Gemini Pro, Gemini Ultra, Gemini Flash 모델 지원
- 텍스트 생성 및 분석 기능
- 환경 변수를 통한 API 키 관리
- 모델 파라미터 설정 기능 (temperature, top_p 등)
- 프롬프트 템플릿 기능

### 3.3 이미지 생성 기능
- Gemini 2.0 Flash를 활용한 이미지 생성
- 텍스트 프롬프트 기반 이미지 생성
- 이미지 크기 및 품질 조정 옵션
- 생성된 이미지의 로컬 저장 및 반환 기능
- 이미지 변형 및 편집 기능

### 3.4 유튜브 분석 기능
- 유튜브 동영상 URL에서 자막 추출
- 동영상 내용 요약 기능
- 주요 토픽 추출 및 분석
- 타임스탬프 기반 내용 구조화
- 여러 동영상 간의 비교 분석

### 3.5 구글 검색 기능
- 웹 검색 쿼리 처리
- 검색 결과 필터링 및 정제
- 컨텍스트에 맞는 정보 추출
- 결과 요약 및 구조화
- 인용 및 소스 추적

## 4. 기술 스택

### 4.1 백엔드
- 언어: TypeScript/Node.js (v18+)
- MCP SDK: @modelcontextprotocol/mcp-sdk
- 웹 프레임워크: Fastify
- 비동기 처리: Node.js 내장 Promise, async/await
- API 통합: @google/generative-ai, youtube-api-v3, google-search-api

### 4.2 인증 및 보안
- API 키 관리: dotenv
- 보안 연결: TLS/SSL
- 토큰 인증: jsonwebtoken

### 4.3 데이터 처리
- 이미지 처리: sharp, canvas
- 텍스트 처리: natural
- 데이터 직렬화: JSON

### 4.4 테스트 및 배포
- 테스트: Jest, supertest
- 로깅: pino
- 컨테이너화: Docker
- 환경 관리: npm

## 5. 시스템 아키텍처

```
[클라이언트 애플리케이션] <--> [MCP 클라이언트] <--> [MCP Gemini 서버] <--> [Google API]
```

### 5.1 MCP 서버 핵심 컴포넌트
1. **서버 초기화 모듈**: MCP 서버 실행 및 설정 관리
2. **도구 관리자**: 사용 가능한 도구 목록 관리 및 노출
3. **인증 관리자**: 클라이언트 요청 인증 및 권한 관리
4. **도구 구현 모듈**: 각 기능별 도구 구현 (이미지 생성, 유튜브 분석, 구글 검색)
5. **Gemini API 클라이언트**: Google Gemini API와의 통신 관리
6. **로깅 및 오류 처리**: 요청 및 응답 로깅, 오류 추적

## 6. 폴더 구조

```
mcp-gemini-server/
├── .env.example                 # 환경 변수 예제
├── .gitignore
├── Dockerfile
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── src/
│   ├── index.ts                # 진입점
│   ├── config.ts               # 서버 설정
│   ├── server.ts               # MCP 서버 구현
│   ├── api/
│   │   ├── gemini.ts           # Gemini API 클라이언트
│   │   ├── youtube.ts          # YouTube API 클라이언트
│   │   └── search.ts           # 검색 API 클라이언트
│   ├── tools/
│   │   ├── base.ts             # 기본 도구 클래스
│   │   ├── image-tools.ts      # 이미지 생성 도구
│   │   ├── youtube-tools.ts    # 유튜브 분석 도구
│   │   └── search-tools.ts     # 검색 도구
│   ├── types/
│   │   ├── request.ts          # 요청 타입
│   │   └── response.ts         # 응답 타입
│   └── utils/
│       ├── auth.ts             # 인증 유틸리티
│       ├── logging.ts          # 로깅 유틸리티
│       └── error.ts            # 오류 처리
├── tests/
│   ├── server.test.ts
│   ├── image-tools.test.ts
│   ├── youtube-tools.test.ts
│   └── search-tools.test.ts
└── examples/
    ├── basic-usage.ts
    ├── image-generation.ts
    ├── youtube-analysis.ts
    └── search-example.ts
```

## 7. MCP 서버 구축 방법

### 7.1 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/yourusername/mcp-gemini-server.git
cd mcp-gemini-server

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 API 키 추가
```

### 7.2 핵심 구현 단계

1. **MCP SDK 설치 및 기본 서버 설정**

```typescript
// src/server.ts
import { MCPServer, Tool, ToolSpec } from '@modelcontextprotocol/mcp-sdk';
import { FastifyInstance } from 'fastify';

class GeminiMCPServer extends MCPServer {
    constructor(config: Config) {
        super();
        this.config = config;
        this._registerTools();
    }

    private _registerTools(): void {
        // 도구 등록 로직
        // 예: this.registerTool(imageGenerationTool);
    }
}
```

2. **도구 구현**

```typescript
// src/tools/image-tools.ts
import { Tool, ToolSpec } from '@modelcontextprotocol/mcp-sdk';
import { GenerativeModel } from '@google/generative-ai';

// 이미지 생성 도구 정의
async function generateImage(params: any): Promise<any> {
    const { prompt, size = '1024x1024' } = params;
    
    // Gemini API 호출
    const model = new GenerativeModel({
        model: 'gemini-2.0-flash',
        apiKey: process.env.GOOGLE_API_KEY
    });
    
    const result = await model.generateContent({
        prompt,
        generationConfig: {
            outputModality: 'image'
        }
    });
    
    // 결과 처리 및 반환
    const imageUrl = result.response.candidates[0].content.parts[0].sourceUri;
    return { imageUrl };
}

// 도구 스펙 정의
export const imageGenerationTool: Tool = {
    name: 'image-generation',
    description: 'Generate images based on text prompts using Google Gemini 2.0 Flash',
    parameters: {
        type: 'object',
        properties: {
            prompt: {
                type: 'string',
                description: 'Text description of the image to generate'
            },
            size: {
                type: 'string',
                description: 'Image size (e.g., "1024x1024")',
                default: '1024x1024'
            }
        },
        required: ['prompt']
    },
    function: generateImage
};
```

3. **메인 진입점 구현**

```typescript
// src/index.ts
import dotenv from 'dotenv';
import { Config } from './config';
import { GeminiMCPServer } from './server';

async function main() {
    dotenv.config();
    const config = new Config();
    
    const server = new GeminiMCPServer(config);
    await server.start();
}

if (require.main === module) {
    main().catch(console.error);
}
```

## 8. Claude와 함께 사용하는 방법

Claude 데스크톱 애플리케이션에서 이 MCP 서버를 사용하려면 다음 단계를 따르세요:

1. **서버 실행**

```bash
cd mcp-gemini-server
npm start
```

2. **Claude 데스크톱 설정**

Claude 데스크톱 애플리케이션의 설정 파일을 수정하여 서버를 등록합니다:

```json
{
  "servers": [
    {
      "name": "Gemini MCP Server",
      "command": "npm",
      "args": ["start"],
      "cwd": "/absolute/path/to/mcp-gemini-server",
      "env": {
        "GOOGLE_API_KEY": "your-api-key"
      }
    }
  ]
}
```

설정 파일 위치:
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

3. **Claude 대화 내에서 사용**

Claude 데스크톱 앱을 재시작한 후, 대화 중에 다음과 같이 사용할 수 있습니다:

```
이미지를 생성해줄래? "푸른 산과 호수가 있는 풍경" 같은 이미지를 만들어줘.
```

Claude는 MCP 서버에 연결하여 이미지 생성 도구를 호출하고 결과를 표시합니다.

## 9. 예상 과제 및 해결 방안

1. **API 키 관리**: 환경 변수를 통한 안전한 API 키 관리 및 키 회전 메커니즘 구현
2. **오류 처리**: 다양한 API 오류 상황을 처리하고 사용자에게 유용한 피드백 제공
3. **성능 최적화**: 응답 시간을 최소화하기 위한 비동기 처리 및 캐싱 전략
4. **확장성**: 새로운 Gemini 모델 및 기능을 쉽게 추가할 수 있는 모듈화된 설계
5. **보안**: 사용자 입력 검증 및 안전한 API 통신 보장

## 10. 향후 확장 계획

1. 웹 인터페이스를 통한 서버 관리 및 모니터링
2. 추가 Google API (Maps, Translate 등) 통합
3. 파인튜닝된 Gemini 모델 지원
4. 다중 모델 연계를 통한 고급 워크플로우 지원
5. 이미지 분석 및 멀티모달 입력 처리 확장

## 11. 결론

이 PRD는 MCP 프로토콜을 활용하여 Google의 Gemini API를 Claude와 같은 다양한 MCP 클라이언트에 통합하는 서버를 구축하기 위한 요구사항과 구현 방안을 제시합니다. Node.js/TypeScript 기반으로 구현되어 JavaScript 생태계의 풍부한 라이브러리와 도구를 활용할 수 있으며, 이미지 생성, 유튜브 분석, 구글 검색 등의 기능을 표준화된 방식으로 제공하여 AI 모델의 기능을 크게 확장할 수 있습니다.
