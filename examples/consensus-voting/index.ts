/**
 * Consensus Voting Pattern Example
 * 
 * Demonstrates multi-judge agreement for improved decision quality.
 */

interface Judge {
  id: string;
  vote(options: string[]): Promise<{ option: string; confidence: number }>;
}

interface VotingStrategy {
  decide(votes: Array<{ judge: string; option: string; confidence: number }>): Promise<string>;
}

class ConsensusVoting {
  private judges: Judge[] = [];
  private strategy: VotingStrategy;

  constructor(strategy: VotingStrategy) {
    this.strategy = strategy;
  }

  addJudge(judge: Judge): void {
    this.judges.push(judge);
  }

  async decide(options: string[]): Promise<string> {
    const votes = await Promise.all(
      this.judges.map(async judge => {
        const vote = await judge.vote(options);
        return { judge: judge.id, ...vote };
      })
    );

    return this.strategy.decide(votes);
  }
}

/* v8 ignore next 48 */
function pickOption(options: string[], index: number): string {
  const option = options[index];
  if (option === undefined) {
    throw new Error(`Option at index ${index} missing (have ${options.length})`);
  }
  return option;
}

// Example judges
const judge1: Judge = {
  id: 'judge-1',
  vote: async (options) => ({ option: pickOption(options, 0), confidence: 0.8 })
};

const judge2: Judge = {
  id: 'judge-2',
  vote: async (options) => ({ option: pickOption(options, 1), confidence: 0.7 })
};

const judge3: Judge = {
  id: 'judge-3',
  vote: async (options) => ({ option: pickOption(options, 0), confidence: 0.9 })
};

// Majority voting strategy
const majorityStrategy: VotingStrategy = {
  decide: async (votes) => {
    const counts = votes.reduce((acc, v) => {
      acc[v.option] = (acc[v.option] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0];
    if (!winner) throw new Error('No votes to tally');
    return winner[0];
  }
};

async function main() {
  const voting = new ConsensusVoting(majorityStrategy);
  voting.addJudge(judge1);
  voting.addJudge(judge2);
  voting.addJudge(judge3);

  const decision = await voting.decide(['Option A', 'Option B', 'Option C']);
  console.log('Decision:', decision);
}

export { ConsensusVoting, majorityStrategy };
export type { Judge, VotingStrategy };
