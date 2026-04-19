/**
 * Token Budget Enforcer Pattern Example
 * 
 * Demonstrates cost-aware token allocation and limits.
 */

interface TokenBudget {
  dailyLimit: number;
  usedToday: number;
  resetTime: Date;
}

class TokenBudgetEnforcer {
  private budget: TokenBudget;

  constructor(dailyLimit: number) {
    this.budget = {
      dailyLimit,
      usedToday: 0,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  async execute<T>(operation: () => Promise<{ result: T; tokens: number }>, estimatedTokens: number = 100): Promise<T> {
    if (this.budget.usedToday + estimatedTokens > this.budget.dailyLimit) {
      throw new Error('Token budget exceeded');
    }

    const { result, tokens } = await operation();
    this.budget.usedToday += tokens;
    console.log(`Used ${tokens} tokens, remaining: ${this.budget.dailyLimit - this.budget.usedToday}`);
    
    return result;
  }

  getRemaining(): number {
    return this.budget.dailyLimit - this.budget.usedToday;
  }
}

async function main() {
  const enforcer = new TokenBudgetEnforcer(1000);

  // Simulate LLM calls
  await enforcer.execute(async () => ({ result: 'Response 1', tokens: 150 }));
  await enforcer.execute(async () => ({ result: 'Response 2', tokens: 200 }));
  
  console.log('Remaining tokens:', enforcer.getRemaining());
}

export { TokenBudgetEnforcer };
