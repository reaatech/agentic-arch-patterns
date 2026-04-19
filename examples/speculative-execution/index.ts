/**
 * Speculative Execution Pattern Example
 * 
 * Demonstrates parallel candidate generation with selection.
 */

interface Candidate<T> {
  id: string;
  result: T;
  score: number;
  latency: number;
}

interface SelectionStrategy<T> {
  select(candidates: Candidate<T>[]): Promise<Candidate<T>>;
}

class SpeculativeExecutor<T> {
  constructor(private strategy: SelectionStrategy<T>) {}

  async execute(generators: Array<() => Promise<T>>): Promise<Candidate<T>> {
    
    // Execute all generators in parallel
    const candidates = await Promise.all(
      generators.map(async (gen, index) => {
        const genStart = Date.now();
        const result = await gen();
        return {
          id: `candidate-${index}`,
          result,
          score: Math.random(), // Simulated scoring
          latency: Date.now() - genStart
        };
      })
    );

    // Select best candidate
    const selected = await this.strategy.select(candidates);
    console.log(`Selected ${selected.id} (score: ${selected.score}, latency: ${selected.latency}ms)`);
    
    return selected;
  }
}

/* v8 ignore next 14 */
async function main() {
  const executor = new SpeculativeExecutor<string>({
    select: async (candidates) => candidates.reduce((best, c) => c.score > best.score ? c : best)
  });

  const generators = [
    async () => 'Fast but lower quality response',
    async () => { await new Promise(r => setTimeout(r, 100)); return 'Slower but higher quality response'; },
    async () => { await new Promise(r => setTimeout(r, 50)); return 'Medium speed response'; }
  ];

  const result = await executor.execute(generators);
  console.log('Final result:', result.result);
}

export { SpeculativeExecutor, Candidate, SelectionStrategy };
