/**
 * Bulkhead Pattern Example
 * 
 * Demonstrates resource isolation to prevent cascading failures.
 */

interface BulkheadOptions {
  maxConcurrent: number;
}

class Bulkhead {
  private running = 0;
  private queue: Array<{
    operation: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];

  constructor(private options: BulkheadOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.running >= this.options.maxConcurrent) {
      console.log('Bulkhead full, queuing request');
      return new Promise<T>((resolve, reject) => {
        this.queue.push({
          operation: operation as () => Promise<unknown>,
          resolve: resolve as (value: unknown) => void,
          reject,
        });
      });
    }

    this.running++;
    try {
      return await operation();
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.options.maxConcurrent) {
      const next = this.queue.shift();
      if (!next) return;
      this.execute(next.operation).then(next.resolve).catch(next.reject);
    }
  }
}

/* v8 ignore next 36 */
// Example usage with different resource pools
class ResourcePool {
  private bulkhead: Bulkhead;

  constructor(name: string, maxConcurrent: number) {
    this.bulkhead = new Bulkhead({ maxConcurrent });
    console.log(`Created resource pool: ${name} (max: ${maxConcurrent})`);
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return this.bulkhead.execute(operation);
  }
}

async function main() {
  const criticalPool = new ResourcePool('Critical', 2);
  const _normalPool = new ResourcePool('Normal', 5);

  // Simulate long-running operations
  const longOperation = async (id: string, duration: number) => {
    console.log(`Starting ${id}`);
    await new Promise(resolve => setTimeout(resolve, duration));
    console.log(`Completed ${id}`);
    return id;
  };

  // Run multiple operations concurrently
  const tasks = Array.from({ length: 6 }, (_, i) =>
    criticalPool.execute(() => longOperation(`critical-${i}`, 1000 + Math.random() * 500))
      .catch(err => console.log(`Critical ${i} failed: ${err.message}`))
  );

  await Promise.all(tasks);
  console.log('All tasks completed');
}

export { Bulkhead, BulkheadOptions, ResourcePool };
