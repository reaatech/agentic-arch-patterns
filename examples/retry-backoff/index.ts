/**
 * Retry with Backoff Pattern Example
 * 
 * Demonstrates exponential backoff with jitter for transient failures.
 */

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}

class RetryWithBackoff {
  constructor(private options: RetryOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    let delay = this.options.baseDelay;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.options.maxRetries) {
          break;
        }

        // Calculate delay with optional jitter
        let actualDelay = delay;
        if (this.options.jitter) {
          actualDelay = delay * (0.5 + Math.random());
        }

        console.log(`Attempt ${attempt + 1} failed, retrying in ${actualDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, actualDelay));
        
        // Exponential backoff
        delay = Math.min(delay * 2, this.options.maxDelay);
      }
    }

    throw lastError!;
  }
}

/* v8 ignore next 24 */
async function main() {
  const retrier = new RetryWithBackoff({
    maxRetries: 4,
    baseDelay: 100,
    maxDelay: 2000,
    jitter: true
  });

  let attemptCount = 0;
  const flakyOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('Transient failure');
    }
    return 'Success!';
  };

  try {
    const result = await retrier.execute(flakyOperation);
    console.log('Result:', result);
  } catch (error) {
    console.log('All retries exhausted:', error);
  }
}

export { RetryWithBackoff, RetryOptions };
