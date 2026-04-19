/**
 * Anomaly Detection Pattern Example
 * 
 * Demonstrates automated deviation identification.
 */

interface AnomalyAlert {
  metric: string;
  value: number;
  expectedMin: number;
  expectedMax: number;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

interface DetectionConfig {
  windowSize: number;
  zScoreThreshold: number;
}

class AnomalyDetector {
  private history: Map<string, number[]> = new Map();

  constructor(private config: DetectionConfig) {}

  record(metric: string, value: number): AnomalyAlert | null {
    const values = this.history.get(metric) || [];
    values.push(value);
    
    // Keep only recent values
    if (values.length > this.config.windowSize) {
      values.shift();
    }
    this.history.set(metric, values);

    // Need enough data for statistical analysis
    if (values.length < 10) return null;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    if (stdDev === 0) return null;

    const zScore = Math.abs(value - mean) / stdDev;

    if (zScore > this.config.zScoreThreshold) {
      const severity = zScore > this.config.zScoreThreshold * 2 ? 'high' : 
                       zScore > this.config.zScoreThreshold * 1.5 ? 'medium' : 'low';
      
      return {
        metric,
        value,
        expectedMin: mean - this.config.zScoreThreshold * stdDev,
        expectedMax: mean + this.config.zScoreThreshold * stdDev,
        severity,
        timestamp: Date.now()
      };
    }

    return null;
  }
}

/* v8 ignore next 16 */
async function main() {
  const detector = new AnomalyDetector({ windowSize: 100, zScoreThreshold: 3 });

  // Normal values
  for (let i = 0; i < 50; i++) {
    const normalValue = 100 + Math.random() * 10 - 5;
    const alert = detector.record('latency_ms', normalValue);
    if (alert) console.log('Alert:', alert);
  }

  // Anomalous spike
  const spikeAlert = detector.record('latency_ms', 500);
  if (spikeAlert) {
    console.log('ANOMALY DETECTED:', spikeAlert);
  }
}

export { AnomalyDetector, AnomalyAlert, DetectionConfig };
