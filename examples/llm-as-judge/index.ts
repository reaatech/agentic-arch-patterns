/**
 * LLM-as-Judge Pattern Example
 * 
 * Demonstrates automated quality evaluation using LLMs.
 */

interface EvaluationCriteria {
  name: string;
  description: string;
  weight: number;
}

interface EvaluationResult {
  criteria: string;
  score: number; // 0-100
  reasoning: string;
}

interface JudgeConfig {
  criteria: EvaluationCriteria[];
  minScore: number;
}

class LLMJudge {
  constructor(private config: JudgeConfig) {}

  async evaluate(_input: string, _output: string): Promise<{ passed: boolean; results: EvaluationResult[]; overallScore: number }> {
    const results: EvaluationResult[] = [];
    
    for (const criterion of this.config.criteria) {
      // Simulate LLM evaluation
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      results.push({
        criteria: criterion.name,
        score,
        reasoning: `Evaluated based on: ${criterion.description}`
      });
    }

    const overallScore = results.reduce((sum, r) => {
      const criterion = this.config.criteria.find(c => c.name === r.criteria);
      return sum + r.score * (criterion?.weight || 1);
    }, 0) / results.reduce((sum, r) => sum + (this.config.criteria.find(c => c.name === r.criteria)?.weight || 1), 0);

    return {
      passed: overallScore >= this.config.minScore,
      results,
      overallScore
    };
  }
}

/* v8 ignore next 18 */
async function main() {
  const judge = new LLMJudge({
    criteria: [
      { name: 'relevance', description: 'Response relevance to query', weight: 2 },
      { name: 'accuracy', description: 'Factual accuracy', weight: 3 },
      { name: 'clarity', description: 'Clarity of expression', weight: 1 }
    ],
    minScore: 70
  });

  const result = await judge.evaluate(
    'What is TypeScript?',
    'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.'
  );

  console.log('Evaluation result:', JSON.stringify(result, null, 2));
  console.log('Passed:', result.passed);
}

export { LLMJudge, JudgeConfig, EvaluationResult };
