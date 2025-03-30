# MCP Gemini API 서버

Google의 Gemini API를 활용한 다목적 AI 서버입니다. 텍스트 생성, 이미지 생성/편집, 비디오 분석, 웹 검색 등 다양한 기능을 제공합니다.

## 주요 기능

- 텍스트 생성 (gemini-2.0-flash)
- 이미지 생성 및 편집 (gemini-2.0-flash-exp)
- YouTube 비디오 분석
- 웹 검색

## 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- Google AI Studio API 키

### 주요 의존성

- @google/generative-ai: ^0.1.3 (Gemini API SDK)
- @fastify/cors: ^8.5.0 (CORS 지원)
- fastify: ^4.29.0 (웹 서버 프레임워크)
- googleapis: ^148.0.0 (Google API 지원)
- typescript: ^5.0.0
- zod: ^3.24.2 (데이터 검증)
- pino: ^8.21.0 (로깅)

### 설치 방법

1. 저장소 클론
```bash
git clone [repository-url]
cd mcp_gemini
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```
GOOGLE_API_KEY=your_api_key_here
```

4. 빌드
```bash
npm run build
```

5. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run start
```

서버는 기본적으로 `http://0.0.0.0:8000`에서 실행됩니다.

## 스크립트

- `npm run build`: TypeScript 컴파일
- `npm run start`: 프로덕션 모드로 서버 실행
- `npm run dev`: 개발 모드로 서버 실행 (ts-node 사용)
- `npm run test`: Jest를 사용한 테스트 실행
- `npm run lint`: ESLint를 사용한 코드 검사
- `npm run format`: Prettier를 사용한 코드 포맷팅

## API 엔드포인트

### 텍스트 생성
- 엔드포인트: `/gem-generate`
- 메소드: POST
- 요청 본문:
```json
{
  "prompt": "생성할 텍스트 프롬프트"
}
```

### 이미지 생성
- 엔드포인트: `/gem-generate-image`
- 메소드: POST
- 요청 본문:
```json
{
  "prompt": "생성할 이미지 프롬프트"
}
```

### 이미지 편집
- 엔드포인트: `/gem-edit-image`
- 메소드: POST
- 요청 본문:
```json
{
  "image": "base64 인코딩된 이미지",
  "prompt": "편집 지시사항"
}
```

### 비디오 분석
- 엔드포인트: `/gem-analyze-video`
- 메소드: POST
- 요청 본문:
```json
{
  "videoUrl": "YouTube 비디오 URL",
  "query": "분석 질문"
}
```

### 웹 검색
- 엔드포인트: `/gem-search`
- 메소드: POST
- 요청 본문:
```json
{
  "query": "검색어"
}
```

## Claude 데스크톱 앱 통합 가이드

### 설정 파일 위치
Claude 데스크톱 앱의 설정 파일은 다음 경로에 위치합니다:
- Windows: `%APPDATA%/Claude/config.json`
- macOS: `~/Library/Application Support/Claude/config.json`

### JSON 설정 예시

```json
{
  "apis": [
    {
      "name": "MCP Gemini",
      "url": "http://localhost:8000",
      "methods": [
        {
          "name": "텍스트 생성",
          "method": "gem-generate",
          "template": {
            "jsonrpc": "2.0",
            "id": "{uuid}",
            "method": "gem-generate",
            "params": {
              "prompt": "{input}"
            }
          }
        },
        {
          "name": "이미지 생성",
          "method": "gem-generate-image",
          "template": {
            "jsonrpc": "2.0",
            "id": "{uuid}",
            "method": "gem-generate-image",
            "params": {
              "prompt": "{input}"
            }
          }
        },
        {
          "name": "비디오 분석",
          "method": "gem-analyze-video",
          "template": {
            "jsonrpc": "2.0",
            "id": "{uuid}",
            "method": "gem-analyze-video",
            "params": {
              "videoUrl": "{input}",
              "query": "이 영상의 주요 내용을 요약해주세요"
            }
          }
        },
        {
          "name": "웹 검색",
          "method": "gem-search",
          "template": {
            "jsonrpc": "2.0",
            "id": "{uuid}",
            "method": "gem-search",
            "params": {
              "query": "{input}"
            }
          }
        }
      ]
    }
  ]
}
```

### 변수 설명

- `{uuid}`: 자동으로 생성되는 고유 요청 ID
- `{input}`: Claude 채팅창에 입력한 텍스트

### 사용 방법

1. Claude 데스크톱 앱의 설정 파일을 엽니다.
2. 위의 JSON 설정을 기존 설정에 추가합니다.
3. Claude 데스크톱 앱을 재시작합니다.
4. 채팅창에서 다음과 같이 사용할 수 있습니다:

```
@MCP Gemini.텍스트 생성 한국의 전통 음식에 대해 설명해주세요
@MCP Gemini.이미지 생성 한옥마을의 아름다운 풍경
@MCP Gemini.비디오 분석 https://youtube.com/watch?v=VIDEO_ID
@MCP Gemini.웹 검색 최신 인공지능 기술 동향
```

### 응답 형식

모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "jsonrpc": "2.0",
  "id": "요청에서 보낸 ID",
  "result": {
    "content": "응답 내용"
  }
}
```

### 오류 응답

오류가 발생한 경우 다음 형식으로 응답합니다:

```json
{
  "jsonrpc": "2.0",
  "id": "요청에서 보낸 ID",
  "error": {
    "code": 오류코드,
    "message": "오류 메시지",
    "data": {
      "details": "상세 오류 정보"
    }
  }
}
```

## 오류 처리

서버는 다음과 같은 상황에서 적절한 오류 응답을 반환합니다:

- 400: 잘못된 요청 형식
- 401: 인증 오류 (API 키 관련)
- 500: 서버 내부 오류

## 보안 고려사항

- API 키는 반드시 환경 변수로 관리하세요
- 프로덕션 환경에서는 적절한 보안 설정을 추가하세요
- 민감한 정보는 로그에 기록하지 않도록 주의하세요

## 문제 해결

### 포트 충돌
이미 8000번 포트가 사용 중인 경우:
```bash
# 기존 Node.js 프로세스 종료
pkill -f "node"
```

### 서버 안정성
서버가 예기치 않게 종료되는 경우:
- PM2나 다른 프로세스 관리자 사용을 고려하세요
- 로그를 확인하여 종료 원인을 파악하세요

## 개발 가이드

### 로깅
- Pino 로거를 사용하여 구조화된 로깅을 구현했습니다
- 개발 환경에서는 pino-pretty를 통해 가독성 있는 로그가 출력됩니다

### 타입 안정성
- TypeScript와 Zod를 사용하여 런타임 타입 안정성을 보장합니다
- API 요청/응답에 대한 스키마 검증이 구현되어 있습니다

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## Smithery MCP 배포 가이드

### 사전 준비사항

1. Smithery 계정 및 액세스 토큰
2. Smithery CLI 설치
```bash
npm install -g @smithery/cli
```

### 배포 단계

1. Smithery에 로그인
```bash
smithery login
```

2. MCP 프로젝트 생성
```bash
smithery create mcp-gemini
```

3. 프로젝트 설정
`smithery.json` 파일을 생성하고 다음 내용을 추가합니다:
```json
{
  "name": "mcp-gemini",
  "version": "1.0.0",
  "type": "service",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "env": {
    "GOOGLE_API_KEY": {
      "required": true,
      "description": "Google AI Studio API 키"
    }
  },
  "ports": {
    "8000": "http"
  }
}
```

4. Dockerfile 생성
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8000
CMD ["npm", "start"]
```

5. 배포
```bash
smithery deploy
```

### Smithery MCP 설정

Smithery MCP에서 서비스가 배포된 후, Claude 데스크톱 앱의 설정에서 다음과 같이 URL을 업데이트합니다:

```json
{
  "apis": [
    {
      "name": "MCP Gemini",
      "url": "https://mcp-gemini.your-smithery-domain.com",  // Smithery에서 제공하는 도메인으로 변경
      "methods": [
        // ... 기존 메소드 설정 ...
      ]
    }
  ]
}
```

### 환경 변수 설정

Smithery 대시보드에서 다음 환경 변수를 설정합니다:

1. `GOOGLE_API_KEY`: Google AI Studio API 키
2. `NODE_ENV`: "production"

### 모니터링 및 로그

- Smithery 대시보드에서 서비스 상태 모니터링
- 로그 확인: `smithery logs mcp-gemini`
- 메트릭 확인: Smithery 대시보드의 메트릭스 탭

### 문제 해결

1. 배포 실패 시
```bash
smithery logs mcp-gemini --tail
```

2. 서비스 재시작
```bash
smithery restart mcp-gemini
```

3. 설정 업데이트
```bash
smithery update mcp-gemini
``` 