/**
 * Orchestrator-Worker Pattern Example
 * 
 * Demonstrates central coordination with task distribution to specialized workers.
 */

interface Task {
  id: string;
  type: 'research' | 'writing' | 'analysis';
  payload: unknown;
}

interface Worker {
  type: string;
  process(task: Task): Promise<unknown>;
}

class Orchestrator {
  private workers: Map<string, Worker> = new Map();

  registerWorker(worker: Worker): void {
    this.workers.set(worker.type, worker);
  }

  async execute(tasks: Task[]): Promise<unknown[]> {
    const results = await Promise.all(
      tasks.map(task => {
        const worker = this.workers.get(task.type);
        if (!worker) {
          throw new Error(`No worker for task type: ${task.type}`);
        }
        return worker.process(task);
      })
    );
    return results;
  }
}

/* v8 ignore next 8 */
// Example workers
const researchWorker: Worker = {
  type: 'research',
  process: async (task) => {
    console.log(`Researching: ${JSON.stringify(task.payload)}`);
    return { findings: ['fact1', 'fact2'], source: 'web' };
  }
};

const writingWorker: Worker = {
  type: 'writing',
  process: async (task) => {
    console.log(`Writing content for: ${JSON.stringify(task.payload)}`);
    return { content: 'Generated article content', wordCount: 500 };
  }
};

/* v8 ignore next 18 */
// Demo usage
async function main() {
  const orchestrator = new Orchestrator();
  orchestrator.registerWorker(researchWorker);
  orchestrator.registerWorker(writingWorker);

  const tasks: Task[] = [
    { id: '1', type: 'research', payload: { query: 'AI trends' } },
    { id: '2', type: 'writing', payload: { topic: 'AI trends', findings: ['fact1', 'fact2'] } }
  ];

  const results = await orchestrator.execute(tasks);
  console.log('Results:', results);
}

export { Orchestrator, Worker, Task };
