/**
 * Metrics Aggregation Pattern Example
 * 
 * Demonstrates statistical metric collection and summarization.
 */

interface MetricPoint {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface AggregatedMetric {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

class MetricsCollector {
  private points: MetricPoint[] = [];

  record(name: string, value: number, labels?: Record<string, string>): void {
    const point: MetricPoint = { name, value, timestamp: Date.now() };
    if (labels !== undefined) point.labels = labels;
    this.points.push(point);
  }

  aggregate(name: string, windowMs: number = 60000): AggregatedMetric | null {
    const cutoff = Date.now() - windowMs;
    const values = this.points
      .filter(p => p.name === name && p.timestamp >= cutoff)
      .map(p => p.value)
      .sort((a, b) => a - b);

    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const at = (i: number): number => {
      const v = values[i];
      if (v === undefined) throw new Error(`Index ${i} out of range`);
      return v;
    };
    return {
      name,
      count: values.length,
      sum,
      min: at(0),
      max: at(values.length - 1),
      avg: sum / values.length,
      p50: at(Math.floor(values.length * 0.5)),
      p95: at(Math.min(values.length - 1, Math.floor(values.length * 0.95))),
      p99: at(Math.min(values.length - 1, Math.floor(values.length * 0.99))),
    };
  }

  getRate(name: string, windowMs: number = 60000): number {
    const cutoff = Date.now() - windowMs;
    const count = this.points.filter(p => p.name === name && p.timestamp >= cutoff).length;
    return count / (windowMs / 1000);
  }
}

/* v8 ignore next 13 */
async function main() {
  const metrics = new MetricsCollector();

  // Simulate recording latency metrics
  for (let i = 0; i < 100; i++) {
    metrics.record('request_latency_ms', Math.random() * 200 + 50);
  }

  const aggregated = metrics.aggregate('request_latency_ms');
  console.log('Aggregated metrics:', JSON.stringify(aggregated, null, 2));
  console.log('Rate:', metrics.getRate('request_latency_ms').toFixed(2), 'req/s');
}

export { MetricsCollector };
export type { MetricPoint, AggregatedMetric };
