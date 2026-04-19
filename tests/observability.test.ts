import { describe, it, expect, vi } from 'vitest';

import { Tracer } from '../examples/distributed-tracing/index.js';
import { StructuredLogger } from '../examples/structured-logging/index.js';
import { HealthChecker } from '../examples/health-check/index.js';
import { MetricsCollector } from '../examples/metrics-aggregation/index.js';
import { AnomalyDetector } from '../examples/anomaly-detection/index.js';

describe('Tracer', () => {
  it('links child spans to their parent trace', () => {
    const t = new Tracer();
    const { context: root } = t.startSpan('root');
    const { context: child } = t.startSpan('child', root);
    t.endSpan(child);
    t.endSpan(root);

    const trace = t.getTrace(root.traceId);
    expect(trace).toHaveLength(2);
    expect(trace.every((s) => s.traceId === root.traceId)).toBe(true);
    const childSpan = trace.find((s) => s.spanId === child.spanId);
    expect(childSpan?.parentSpanId).toBe(root.spanId);
  });

  it('records end time when a span is ended', () => {
    const t = new Tracer();
    const { context } = t.startSpan('op');
    t.endSpan(context);
    const [span] = t.getTrace(context.traceId);
    expect(span?.endTime).toBeDefined();
  });
});

describe('StructuredLogger', () => {
  it('emits a JSON log event with service and level', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const logger = new StructuredLogger({ service: 'svc' });
      logger.info('hello', { traceId: 't1' });
      expect(spy).toHaveBeenCalledTimes(1);
      const payload = JSON.parse(spy.mock.calls[0]?.[0] as string);
      expect(payload).toMatchObject({ service: 'svc', level: 'info', message: 'hello', traceId: 't1' });
      expect(typeof payload.timestamp).toBe('string');
    } finally {
      spy.mockRestore();
    }
  });
});

describe('HealthChecker', () => {
  it('reports healthy when every check passes', async () => {
    const hc = new HealthChecker();
    hc.addCheck({ name: 'db', check: async () => ({ status: 'pass' }) });
    hc.addCheck({ name: 'api', check: async () => ({ status: 'pass' }) });
    const status = await hc.check();
    expect(status.status).toBe('healthy');
  });

  it('reports degraded when one check fails and another passes', async () => {
    const hc = new HealthChecker();
    hc.addCheck({ name: 'db', check: async () => ({ status: 'pass' }) });
    hc.addCheck({ name: 'api', check: async () => ({ status: 'fail', error: 'down' }) });
    const status = await hc.check();
    expect(status.status).toBe('degraded');
  });

  it('reports unhealthy when every check fails', async () => {
    const hc = new HealthChecker();
    hc.addCheck({ name: 'db', check: async () => ({ status: 'fail' }) });
    hc.addCheck({ name: 'api', check: async () => { throw new Error('boom'); } });
    const status = await hc.check();
    expect(status.status).toBe('unhealthy');
    expect(status.checks['api']?.error).toBe('boom');
  });
});

describe('MetricsCollector', () => {
  it('aggregates recorded points into summary stats', () => {
    const m = new MetricsCollector();
    for (const v of [10, 20, 30, 40, 50]) m.record('latency', v);
    const agg = m.aggregate('latency');
    expect(agg).not.toBeNull();
    expect(agg?.count).toBe(5);
    expect(agg?.min).toBe(10);
    expect(agg?.max).toBe(50);
    expect(agg?.avg).toBe(30);
  });

  it('returns null when no points exist in the window', () => {
    const m = new MetricsCollector();
    expect(m.aggregate('unknown')).toBeNull();
  });
});

describe('AnomalyDetector', () => {
  it('returns null before enough samples have been observed', () => {
    const d = new AnomalyDetector({ windowSize: 100, zScoreThreshold: 3 });
    expect(d.record('m', 1)).toBeNull();
  });

  it('alerts when a value deviates beyond the z-score threshold', () => {
    const d = new AnomalyDetector({ windowSize: 100, zScoreThreshold: 3 });
    for (let i = 0; i < 30; i++) d.record('m', 100 + (i % 2 === 0 ? 1 : -1));
    const alert = d.record('m', 500);
    expect(alert).not.toBeNull();
    expect(alert?.metric).toBe('m');
    expect(['low', 'medium', 'high']).toContain(alert?.severity);
  });
});
