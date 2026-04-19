/**
 * Confidence Gate Pattern Example
 * 
 * Demonstrates threshold-based routing decisions.
 */

interface ClassificationResult {
  intent: string;
  confidence: number;
}

interface ConfidenceGateOptions {
  highConfidenceThreshold: number;
  lowConfidenceThreshold: number;
}

type RoutingDecision = 'direct' | 'clarify' | 'human';

class ConfidenceGate {
  constructor(private options: ConfidenceGateOptions) {}

  route(classification: ClassificationResult): RoutingDecision {
    const { confidence } = classification;

    if (confidence >= this.options.highConfidenceThreshold) {
      return 'direct';
    } else if (confidence >= this.options.lowConfidenceThreshold) {
      return 'clarify';
    } else {
      return 'human';
    }
  }
}

/* v8 ignore next 19 */
// Example usage
async function main() {
  const gate = new ConfidenceGate({
    highConfidenceThreshold: 0.8,
    lowConfidenceThreshold: 0.5
  });

  const testCases: ClassificationResult[] = [
    { intent: 'greeting', confidence: 0.95 },
    { intent: 'support', confidence: 0.65 },
    { intent: 'complaint', confidence: 0.35 }
  ];

  for (const test of testCases) {
    const decision = gate.route(test);
    console.log(`Intent: ${test.intent} (${test.confidence}) → ${decision}`);
  }
}

export { ConfidenceGate, ClassificationResult, RoutingDecision };
