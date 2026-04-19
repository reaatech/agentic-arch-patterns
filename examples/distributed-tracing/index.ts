/**
 * Distributed Tracing Pattern Example
 * 
 * Demonstrates end-to-end request correlation across services.
 */

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, unknown>;
}

interface TraceContext {
  traceId: string;
  spanId: string;
}

class Tracer {
  private spans: Span[] = [];

  startSpan(name: string, parent?: TraceContext, attributes?: Record<string, unknown>): { span: Span; context: TraceContext } {
    const spanId = `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const span: Span = {
      traceId: parent?.traceId ?? `trace-${Date.now()}`,
      spanId,
      name,
      startTime: Date.now(),
      attributes: attributes ?? {},
      ...(parent?.spanId !== undefined ? { parentSpanId: parent.spanId } : {}),
    };

    this.spans.push(span);
    return { span, context: { traceId: span.traceId, spanId } };
  }

  endSpan(context: TraceContext): void {
    const span = this.spans.find(s => s.spanId === context.spanId);
    if (span) {
      span.endTime = Date.now();
    }
  }

  getTrace(traceId: string): Span[] {
    return this.spans.filter(s => s.traceId === traceId);
  }
}

/* v8 ignore next 23 */
async function simulateServiceCall(tracer: Tracer, name: string, parent: TraceContext, duration: number): Promise<void> {
  const { context } = tracer.startSpan(name, parent);
  await new Promise(r => setTimeout(r, duration));
  tracer.endSpan(context);
}

async function main() {
  const tracer = new Tracer();

  // Simulate a request flow
  const { context: rootContext } = tracer.startSpan('http-request', undefined, { method: 'POST', path: '/api/chat' });

  await simulateServiceCall(tracer, 'classifier', rootContext, 50);
  await simulateServiceCall(tracer, 'orchestrator', rootContext, 100);
  await simulateServiceCall(tracer, 'llm-api', rootContext, 200);

  tracer.endSpan(rootContext);

  // Show trace
  const trace = tracer.getTrace(rootContext.traceId);
  console.log('Trace:', JSON.stringify(trace, null, 2));
}

export { Tracer };
export type { Span, TraceContext };
