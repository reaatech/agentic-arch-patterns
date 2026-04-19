/**
 * Idempotency Cache Pattern Example
 * 
 * Demonstrates request deduplication using idempotency keys.
 */

interface CachedResponse {
  idempotencyKey: string;
  response: unknown;
  createdAt: number;
}

interface IdempotencyCacheOptions {
  ttl: number;
}

class IdempotencyCache {
  private cache = new Map<string, CachedResponse>();
  private inFlight = new Map<string, Promise<unknown>>();

  constructor(private options: IdempotencyCacheOptions) {}

  async getOrExecute<T>(
    idempotencyKey: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(idempotencyKey);
    if (cached && Date.now() - cached.createdAt < this.options.ttl) {
      console.log(`Cache hit for key: ${idempotencyKey}`);
      return cached.response as T;
    }

    const pending = this.inFlight.get(idempotencyKey);
    if (pending) {
      console.log(`Joining in-flight request for key: ${idempotencyKey}`);
      return pending as Promise<T>;
    }

    // Execute and cache
    console.log(`Cache miss for key: ${idempotencyKey}, executing...`);
    const execution = operation()
      .then((response) => {
        this.cache.set(idempotencyKey, {
          idempotencyKey,
          response,
          createdAt: Date.now()
        });
        return response;
      })
      .finally(() => {
        this.inFlight.delete(idempotencyKey);
      });

    this.inFlight.set(idempotencyKey, execution);
    return execution;
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}

/* v8 ignore next 25 */
// Example usage
async function main() {
  const cache = new IdempotencyCache({ ttl: 60000 }); // 1 minute TTL

  let callCount = 0;
  const expensiveOperation = async () => {
    callCount++;
    await new Promise(resolve => setTimeout(resolve, 100));
    return { result: `Expensive result #${callCount}` };
  };

  // First call - executes
  const result1 = await cache.getOrExecute('key-1', expensiveOperation);
  console.log('First call:', result1);

  // Second call with same key - returns cached
  const result2 = await cache.getOrExecute('key-1', expensiveOperation);
  console.log('Second call (same key):', result2);

  // Third call with different key - executes
  const result3 = await cache.getOrExecute('key-2', expensiveOperation);
  console.log('Third call (different key):', result3);

  console.log(`Total executions: ${callCount}`);
}

export { IdempotencyCache, IdempotencyCacheOptions, CachedResponse };
