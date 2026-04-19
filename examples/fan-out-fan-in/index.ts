/**
 * Fan-Out/Fan-In Pattern Example
 * 
 * Demonstrates parallel execution with result aggregation.
 */

interface WorkItem {
  id: string;
  data: unknown;
}

interface Worker {
  id: string;
  process(item: WorkItem): Promise<{ itemId: string; result: unknown; duration: number }>;
}

interface Aggregator<T> {
  aggregate(results: Array<{ itemId: string; result: unknown; duration: number }>): Promise<T>;
}

class FanOutFanIn<T> {
  private workers: Worker[] = [];
  private aggregator: Aggregator<T>;

  constructor(aggregator: Aggregator<T>) {
    this.aggregator = aggregator;
  }

  addWorker(worker: Worker): void {
    this.workers.push(worker);
  }

  async execute(items: WorkItem[]): Promise<T> {
    console.log(`Fanning out ${items.length} items to ${this.workers.length} workers`);
    
    if (this.workers.length === 0) {
      throw new Error('FanOutFanIn requires at least one worker');
    }

    // Fan-out: distribute work to workers in parallel
    const workerPromises = items.map((item, index) => {
      const worker = this.workers[index % this.workers.length];
      if (!worker) throw new Error('Worker lookup failed');
      return worker.process(item);
    });

    // Wait for all workers to complete
    const results = await Promise.all(workerPromises);
    
    console.log(`Fanning in ${results.length} results`);
    
    // Fan-in: aggregate results
    return this.aggregator.aggregate(results);
  }
}

// Example workers
const fastWorker: Worker = {
  id: 'fast-1',
  process: async (item) => {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      itemId: item.id,
      result: `Fast processed: ${item.data}`,
      duration: Date.now() - start
    };
  }
};

const slowWorker: Worker = {
  id: 'slow-1',
  process: async (item) => {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      itemId: item.id,
      result: `Slow processed: ${item.data}`,
      duration: Date.now() - start
    };
  }
};

/* v8 ignore next 25 */
// Example aggregator
const resultsAggregator: Aggregator<{ results: unknown[]; avgDuration: number }> = {
  aggregate: async (results) => ({
    results: results.map(r => r.result),
    avgDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length
  })
};

async function main() {
  const fanOutFanIn = new FanOutFanIn(resultsAggregator);
  fanOutFanIn.addWorker(fastWorker);
  fanOutFanIn.addWorker(slowWorker);

  const items: WorkItem[] = [
    { id: '1', data: 'task1' },
    { id: '2', data: 'task2' },
    { id: '3', data: 'task3' },
    { id: '4', data: 'task4' }
  ];

  const result = await fanOutFanIn.execute(items);
  console.log('Aggregated result:', result);
}

export { FanOutFanIn };
export type { WorkItem, Worker, Aggregator };
