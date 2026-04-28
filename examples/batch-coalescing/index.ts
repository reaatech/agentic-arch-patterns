/**
 * Batch Coalescing Pattern Example
 * 
 * Demonstrates request batching for improved throughput.
 */

interface BatchOptions {
  maxSize: number;
  maxWaitMs: number;
}

class BatchCoalescer<T, R> {
  private queue: Array<{ item: T; resolve: (result: R) => void; reject: (error: Error) => void }> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private processor: (items: T[]) => Promise<R[]>,
    private options: BatchOptions
  ) {}

  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.queue.length >= this.options.maxSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.options.maxWaitMs);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.queue.splice(0);
    if (batch.length === 0) return;

    console.log(`Processing batch of ${batch.length} items`);

    try {
      const items = batch.map(b => b.item);
      const results = await this.processor(items);
      
      batch.forEach((b, i) => {
        const r = results[i];
        if (r === undefined) {
          b.reject(new Error(`Missing result at index ${i}`));
        } else {
          b.resolve(r);
        }
      });
    } catch (error) {
      batch.forEach(b => b.reject(error as Error));
    }
  }
}

/* v8 ignore next 20 */
async function main() {
  const coalescer = new BatchCoalescer<string, string>(
    async (items) => {
      await new Promise(r => setTimeout(r, 100));
      return items.map(item => `Processed: ${item}`);
    },
    { maxSize: 3, maxWaitMs: 500 }
  );

  // Add items rapidly
  const results = await Promise.all([
    coalescer.add('item1'),
    coalescer.add('item2'),
    coalescer.add('item3'),
    coalescer.add('item4'),
    coalescer.add('item5')
  ]);

  console.log('Results:', results);
}

export { BatchCoalescer, BatchOptions };
