export interface ChatMessage {
  role: string;
  content: string;
}

export interface GenerateRequest {
  prompt: string;
}

export interface VideoAnalysisRequest {
  videoUrl: string;
  query: string;
}

export interface SearchRequest {
  query: string;
}

export interface ChatStartRequest {
  history?: ChatMessage[];
}

export interface ChatStartResponse {
  sessionId: string;
}

export interface ApiResponse<T> {
  result: T;
  error?: string;
} 