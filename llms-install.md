# MCP Gemini 서버 설치 가이드 (AI 에이전트용)

## 환경 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- Google AI Studio API 키

## 설치 단계

### 1. 저장소 클론
```bash
git clone https://github.com/techkwon/mcp-gemini.git
cd mcp-gemini
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일 생성:
```bash
echo "GOOGLE_API_KEY=your_api_key_here" > .env
```

API 키 유효성 검증:
```bash
# API 키가 올바르게 설정되었는지 확인
cat .env
```

### 4. 빌드
```bash
npm run build
```

### 5. 서버 실행
개발 모드:
```bash
npm run dev
```

프로덕션 모드:
```bash
npm run start
```

## 설정 검증

### 포트 확인
```bash
# 8000번 포트 사용 여부 확인
lsof -i :8000
```

### API 키 검증
1. 환경 변수가 올바르게 로드되었는지 확인
2. Google AI Studio 대시보드에서 API 키 상태 확인
3. 테스트 요청 실행:
```bash
curl -X POST http://localhost:8000/gem-generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "테스트 메시지"}'
```

### CORS 설정
기본적으로 모든 출처에서의 요청을 허용합니다. 필요한 경우 `src/server.ts`에서 CORS 설정을 수정할 수 있습니다.

## 문제 해결

### 포트 충돌
8000번 포트가 이미 사용 중인 경우:
```bash
# 기존 프로세스 종료
pkill -f "node"
# 또는
kill $(lsof -t -i:8000)
```

### API 키 오류
1. API 키 형식 확인
2. 키 권한 및 할당량 확인
3. Google AI Studio 대시보드에서 키 재생성

### 일반적인 문제

#### 1. 의존성 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

#### 2. 빌드 오류
```bash
# 빌드 파일 삭제 후 재빌드
rm -rf dist
npm run build
```

#### 3. TypeScript 오류
```bash
# TypeScript 설정 확인
cat tsconfig.json
```

## 상태 모니터링

서버 상태 확인:
```bash
# 프로세스 확인
ps aux | grep node

# 로그 확인
tail -f logs/server.log
```

## 보안 설정

1. API 키 보호
2. 요청 제한 설정
3. 로깅 설정

## 설치 완료 확인

다음 엔드포인트들이 정상적으로 응답하는지 확인:

1. 텍스트 생성: `/gem-generate`
2. 이미지 생성: `/gem-generate-image`
3. 비디오 분석: `/gem-analyze-video`
4. 웹 검색: `/gem-search` 