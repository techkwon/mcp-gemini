# MCP Gemini API 서버

Cursor와 Claude를 위한 Google Gemini API 서버입니다. 텍스트 생성, 이미지 분석, 비디오 분석 등 Gemini의 다양한 기능을 제공합니다.

## 주요 기능

- 텍스트 생성 (gemini-2.0-flash 모델 사용)
- 이미지 생성 및 분석
- YouTube 비디오 분석
- 웹 검색

## 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- Google API 키 (Gemini API 접근용)

### 설치

```bash
# 저장소 클론
git clone https://github.com/techkwon/mcp-gemini.git
cd mcp-gemini

# 의존성 설치
npm install
```

### 환경 설정

1. `config.ts` 파일에 Google API 키 설정:

```typescript
export default {
  googleApiKey: "your_api_key_here",
  // 기타 설정...
};
```

### 빌드 및 실행

```bash
# TypeScript 빌드
npm run build

# 서버 시작 (PM2 사용)
npm start

# 개발 모드로 실행
npm run dev
```

### PM2 서버 관리

서버는 PM2를 통해 자동으로 관리됩니다. 다음 명령어로 서버를 관리할 수 있습니다:

```bash
# 서버 상태 확인
npm run status

# 서버 로그 확인
npm run logs

# 서버 중지
npm run stop

# 서버 재시작
npm run restart

# 시스템 재시작 시 자동 실행 설정
pm2 startup
pm2 save
```

## Cursor/Claude 연동

### MCP 설정

`~/.cursor/mcp.json` 파일에 다음 설정을 추가하세요:

```json
{
  "github.com/techkwon/mcp-gemini": {
    "command": "npm",
    "args": ["start"],
    "cwd": "<프로젝트_경로>",
    "env": {
      "NODE_ENV": "production"
    },
    "disabled": false,
    "autoStart": true,
    "autoApprove": [
      "gem-generate",
      "gem-generate-image",
      "gem-analyze-video",
      "gem-search"
    ]
  }
}
```

### API 엔드포인트

- `/gem-generate`: 텍스트 생성
- `/gem-generate-image`: 이미지 생성/분석
- `/gem-analyze-video`: YouTube 비디오 분석
- `/gem-search`: 웹 검색

## 주요 업데이트

### 최신 버전 (2024-03)
- PM2를 통한 서버 자동화 구현
- gemini-2.0-flash 모델로 통일
- 자동 재시작 및 오류 복구 기능 추가
- 환경 설정 개선

### 이전 버전
- YouTube 비디오 분석 기능 추가
- 이미지 생성/분석 기능 개선
- 웹 검색 기능 추가

## 문제 해결

### 일반적인 문제

1. **서버가 시작되지 않는 경우**
   ```bash
   # PM2 로그 확인
   npm run logs
   
   # PM2 프로세스 상태 확인
   npm run status
   ```

2. **API 키 오류**
   - `config.ts` 파일에서 API 키가 올바르게 설정되었는지 확인
   - Gemini API 할당량 및 권한 확인

3. **메모리 사용량 문제**
   - `ecosystem.config.js`에서 메모리 제한 설정 확인
   - PM2 모니터링으로 메모리 사용량 추적

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 연락처

프로젝트 관리자: techkwon
이메일: techkwon@example.com
프로젝트 링크: [https://github.com/techkwon/mcp-gemini](https://github.com/techkwon/mcp-gemini)

## 주요 의존성

- @google/generative-ai: ^0.1.3 (Gemini API SDK)
- @fastify/cors: ^8.5.0 (CORS 지원)
- fastify: ^4.29.0 (웹 서버 프레임워크)
- googleapis: ^148.0.0 (Google API 지원)
- typescript: ^5.0.0
- zod: ^3.24.2 (데이터 검증)
- pino: ^8.21.0 (로깅)

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

## CLINE MCP 마켓플레이스 등록 가이드

### 사전 준비사항

1. GitHub 저장소가 공개되어 있어야 합니다
2. README.md 파일에 명확한 설치 및 설정 방법이 포함되어 있어야 합니다
3. (선택사항) `llms-install.md` 파일을 통해 AI 에이전트를 위한 추가 설치 가이드를 제공할 수 있습니다

### 등록 절차

1. [CLINE MCP 마켓플레이스 저장소](https://github.com/cline/mcp-marketplace)에 새로운 이슈를 생성합니다

2. 이슈에 다음 정보를 포함합니다:
   - **GitHub 저장소 URL:** https://github.com/techkwon/mcp-gemini
   - **로고 이미지:** 400×400 크기의 PNG 파일
   - **추가 이유:** 이 MCP 서버가 CLINE 사용자들에게 제공할 수 있는 가치
   예시:
   ```markdown
   ## MCP Gemini 서버 등록 요청
   
   ### GitHub 저장소
   https://github.com/techkwon/mcp-gemini
   
   ### 주요 기능
   - Gemini API를 활용한 텍스트 생성
   - 이미지 생성 및 편집 (gemini-2.0-flash-exp 모델 사용)
   - YouTube 비디오 콘텐츠 분석
   - 웹 검색 기능
   
   ### 사용자 이점
   - 최신 Gemini 모델을 MCP 프로토콜을 통해 쉽게 활용
   - 다양한 미디어 형식(텍스트, 이미지, 비디오) 처리 가능
   - 명확한 JSON-RPC 인터페이스로 쉬운 통합
   - 상세한 문서화와 예제 제공
   ```

3. CLINE이 README.md만으로 서버를 성공적으로 설치할 수 있는지 테스트합니다

### 승인 절차

1. CLINE 팀이 제출된 MCP 서버를 검토합니다
2. 보안 및 안정성 검증을 진행합니다
3. 승인되면 마켓플레이스에 등록되어 모든 CLINE 사용자가 접근할 수 있게 됩니다

### 설치 가이드 최적화

`llms-install.md` 파일을 생성하여 AI 에이전트를 위한 추가 설치 가이드를 제공할 수 있습니다:

```markdown
# MCP Gemini 서버 설치 가이드 (AI 에이전트용)

## 환경 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- Google AI Studio API 키

## 설치 단계
1. 저장소 클론
2. 의존성 설치: `npm install`
3. 환경 변수 설정: GOOGLE_API_KEY 추가
4. 빌드: `npm run build`
5. 서버 실행: `npm run start`

## 설정 검증
- 8000번 포트 사용 가능 여부 확인
- API 키 유효성 검증
- CORS 설정 확인

## 문제 해결
- 포트 충돌 시 해결 방법
- API 키 오류 해결 방법
- 일반적인 설치 문제 해결 가이드
``` 