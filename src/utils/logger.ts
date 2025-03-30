import pino from 'pino';

// stderr로 로그 출력
export const logger = pino({
  level: process.env.DEBUG === 'true' ? 'debug' : 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
}, process.stderr); 