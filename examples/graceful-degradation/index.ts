/**
 * Graceful Degradation Pattern Example
 * 
 * Demonstrates quality reduction under load.
 */

interface QualityLevel {
  name: string;
  maxConcurrentRequests: number;
  features: string[];
}

class GracefulDegradation {
  private currentLevel: number = 0;
  private activeRequests = 0;
  private readonly levels: QualityLevel[];

  constructor(levels: QualityLevel[]) {
    if (levels.length === 0) {
      throw new Error('GracefulDegradation requires at least one quality level');
    }
    this.levels = levels;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.activeRequests++;
    this.adjustLevel();

    const level = this.getCurrentLevel();
    console.log(`Executing at quality level: ${level.name}`);

    try {
      return await operation();
    } finally {
      this.activeRequests--;
      this.adjustLevel();
    }
  }

  private adjustLevel(): void {
    const current = this.getCurrentLevel();
    // Degrade when load is high
    if (this.activeRequests > current.maxConcurrentRequests) {
      if (this.currentLevel < this.levels.length - 1) {
        this.currentLevel++;
        console.log(`Degraded to level: ${this.getCurrentLevel().name}`);
      }
    } else if (this.currentLevel > 0 && this.activeRequests < current.maxConcurrentRequests * 0.5) {
      this.currentLevel--;
      console.log(`Upgraded to level: ${this.getCurrentLevel().name}`);
    }
  }

  getCurrentLevel(): QualityLevel {
    const level = this.levels[this.currentLevel];
    if (!level) throw new Error(`Invalid level index ${this.currentLevel}`);
    return level;
  }
}

/* v8 ignore next 22 */
const qualityLevels: QualityLevel[] = [
  { name: 'Full', maxConcurrentRequests: 10, features: ['analysis', 'recommendations', 'personalization'] },
  { name: 'Reduced', maxConcurrentRequests: 20, features: ['analysis', 'recommendations'] },
  { name: 'Basic', maxConcurrentRequests: 50, features: ['analysis'] },
  { name: 'Minimal', maxConcurrentRequests: 100, features: [] }
];

async function main() {
  const degradation = new GracefulDegradation(qualityLevels);

  // Simulate increasing load
  const tasks = Array.from({ length: 15 }, (_, i) =>
    degradation.execute(async () => {
      await new Promise(r => setTimeout(r, 100));
      return `Task ${i} completed`;
    })
  );

  await Promise.all(tasks);
  console.log('Final quality level:', degradation.getCurrentLevel().name);
}

export { GracefulDegradation };
export type { QualityLevel };
