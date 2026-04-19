/**
 * Supervisor Pattern Example
 * 
 * Demonstrates hierarchical oversight with escalation paths.
 */

interface WorkItem {
  id: string;
  complexity: 'low' | 'medium' | 'high';
  content: string;
}

interface WorkerAgent {
  id: string;
  capability: number; // 0-1 skill level
  process(item: WorkItem): Promise<{ result: string; confidence: number }>;
}

interface SupervisorAgent {
  evaluate(result: { result: string; confidence: number }, item: WorkItem): Promise<'accept' | 'revise' | 'escalate'>;
  escalate(item: WorkItem): Promise<string>;
}

class Supervisor {
  private workers: WorkerAgent[] = [];
  private supervisor: SupervisorAgent;
  private maxRevisions: number;

  constructor(supervisor: SupervisorAgent, maxRevisions: number = 3) {
    this.supervisor = supervisor;
    this.maxRevisions = maxRevisions;
  }

  addWorker(worker: WorkerAgent): void {
    this.workers.push(worker);
  }

  async process(item: WorkItem): Promise<string> {
    // Select best worker based on complexity
    const worker = this.selectWorker(item.complexity);
    
    let result = await worker.process(item);
    let evaluation = await this.supervisor.evaluate(result, item);
    let revisions = 0;

    while (evaluation === 'revise' && revisions < this.maxRevisions) {
      revisions++;
      result = await worker.process(item);
      evaluation = await this.supervisor.evaluate(result, item);
    }

    if (evaluation === 'revise') {
      evaluation = 'escalate';
    }
    
    if (evaluation === 'escalate') {
      return this.supervisor.escalate(item);
    }
    
    return result.result;
  }

  private selectWorker(complexity: string): WorkerAgent {
    const requiredCapability = complexity === 'high' ? 0.9 : complexity === 'medium' ? 0.7 : 0.5;
    return this.workers.reduce((best, worker) => 
      worker.capability >= requiredCapability && worker.capability > best.capability ? worker : best
    );
  }
}

// Example implementation
const worker: WorkerAgent = {
  id: 'worker-1',
  capability: 0.8,
  process: async (item) => ({
    result: `Processed: ${item.content}`,
    confidence: Math.random() // Simulated confidence
  })
};

const supervisor: SupervisorAgent = {
  evaluate: async (result, _item) => {
    if (result.confidence > 0.7) return 'accept';
    if (result.confidence > 0.4) return 'revise';
    return 'escalate';
  },
  escalate: async (item) => `Escalated to human: ${item.content}`
};

/* v8 ignore next 13 */
async function main() {
  const supervisorAgent = new Supervisor(supervisor);
  supervisorAgent.addWorker(worker);

  const item: WorkItem = {
    id: '1',
    complexity: 'medium',
    content: 'Complex customer query'
  };

  const result = await supervisorAgent.process(item);
  console.log('Final result:', result);
}

export { Supervisor, WorkItem, WorkerAgent, SupervisorAgent };
