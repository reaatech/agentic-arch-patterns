/**
 * Structured Logging Pattern Example
 * 
 * Demonstrates machine-parseable JSON log events.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEvent {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  traceId?: string;
  userId?: string;
  [key: string]: unknown;
}

interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

class StructuredLogger implements Logger {
  constructor(private defaultContext: { service: string } & Partial<Omit<LogEvent, 'service'>>) {}

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const logEvent: LogEvent = {
      ...this.defaultContext,
      ...context,
      timestamp: new Date().toISOString(),
      service: this.defaultContext.service,
      level,
      message,
    };
    console.log(JSON.stringify(logEvent));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.emit('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.emit('error', message, context);
  }
}

/* v8 ignore next 8 */
async function main() {
  const logger = new StructuredLogger({ service: 'chat-agent' });

  logger.info('Request received', { traceId: 'abc-123', method: 'POST', path: '/chat' });
  logger.debug('Processing input', { traceId: 'abc-123', inputLength: 42 });
  logger.warn('Low confidence classification', { traceId: 'abc-123', confidence: 0.45 });
  logger.error('API call failed', { traceId: 'abc-123', error: 'timeout', retryCount: 3 });
}

export { StructuredLogger };
export type { Logger, LogEvent, LogLevel };
