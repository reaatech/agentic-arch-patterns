/**
 * Circuit Breaker Pattern Example
 * 
 * Demonstrates per-agent failure isolation with state machine.
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  threshold: number;
  resetTimeout: number;
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime?: number;
  private successCount = 0;

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker: HALF_OPEN, attempting recovery');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = 'CLOSED';
        console.log('Circuit breaker: CLOSED, recovered');
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.options.threshold) {
      this.state = 'OPEN';
      console.log('Circuit breaker: OPEN, threshold reached');
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

/* v8 ignore next 21 */
async function main() {
  const breaker = new CircuitBreaker({ threshold: 3, resetTimeout: 2000 });

  // Simulate a flaky service
  let callCount = 0;
  const flakyService = async () => {
    callCount++;
    if (callCount <= 5) throw new Error('Service unavailable');
    return 'Success!';
  };

  for (let i = 0; i < 8; i++) {
    try {
      const result = await breaker.execute(flakyService);
      console.log(`Call ${i + 1}: ${result}`);
    } catch (error) {
      console.log(`Call ${i + 1}: ${error instanceof Error ? error.message : 'Failed'}`);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export { CircuitBreaker, CircuitState, CircuitBreakerOptions };
