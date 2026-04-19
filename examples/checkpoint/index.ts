/**
 * Checkpoint Pattern Example
 * 
 * Demonstrates periodic state persistence for recovery.
 */

interface Checkpoint {
  id: string;
  state: Record<string, unknown>;
  timestamp: number;
  metadata: Record<string, unknown>;
}

interface CheckpointStore {
  save(checkpoint: Checkpoint): Promise<void>;
  load(id: string): Promise<Checkpoint | null>;
  list(): Promise<Checkpoint[]>;
}

class CheckpointManager {
  private checkpoints: Checkpoint[] = [];

  constructor(private store: CheckpointStore) {}

  async createCheckpoint(state: Record<string, unknown>, metadata?: Record<string, unknown>): Promise<string> {
    const checkpoint: Checkpoint = {
      id: `checkpoint-${Date.now()}`,
      state,
      timestamp: Date.now(),
      metadata: metadata || {}
    };

    await this.store.save(checkpoint);
    this.checkpoints.push(checkpoint);
    console.log(`Created checkpoint: ${checkpoint.id}`);
    return checkpoint.id;
  }

  async restore(id: string): Promise<Record<string, unknown> | null> {
    const checkpoint = await this.store.load(id);
    if (checkpoint) {
      console.log(`Restored checkpoint: ${id}`);
      return checkpoint.state;
    }
    console.log(`Checkpoint not found: ${id}`);
    return null;
  }

  async getLatest(): Promise<Checkpoint | null> {
    const checkpoints = await this.store.list();
    return checkpoints.sort((a, b) => b.timestamp - a.timestamp)[0] ?? null;
  }
}

// In-memory store for demonstration
function createMemoryStore(): CheckpointStore {
  const checkpoints = new Map<string, Checkpoint>();
  return {
    async save(checkpoint) { checkpoints.set(checkpoint.id, checkpoint); },
    async load(id) { return checkpoints.get(id) ?? null; },
    async list() { return Array.from(checkpoints.values()); },
  };
}

const memoryStore: CheckpointStore = createMemoryStore();

async function main() {
  const manager = new CheckpointManager(memoryStore);

  // Create checkpoints
  const id1 = await manager.createCheckpoint({ step: 1, data: 'initial' });
  await manager.createCheckpoint({ step: 2, data: 'processed' });

  // Restore from checkpoint
  const restored = await manager.restore(id1);
  console.log('Restored state:', restored);

  // Get latest
  const latest = await manager.getLatest();
  console.log('Latest checkpoint:', latest?.id);
}

export { CheckpointManager, createMemoryStore };
export type { Checkpoint, CheckpointStore };
