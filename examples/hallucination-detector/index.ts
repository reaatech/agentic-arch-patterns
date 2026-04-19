/**
 * Hallucination Detector Pattern Example
 * 
 * Demonstrates fact-checking with source verification.
 */

interface FactCheck {
  claim: string;
  verified: boolean;
  sources: Array<{ name: string; reliability: number; matches: boolean }>;
  confidence: number;
}

interface Source {
  name: string;
  reliability: number; // 0-1
  search: (claim: string) => Promise<boolean>;
}

class HallucinationDetector {
  constructor(private sources: Source[], private minConfidence: number) {}

  async check(claim: string): Promise<FactCheck> {
    const results = await Promise.all(
      this.sources.map(async source => {
        const matches = await source.search(claim);
        return {
          name: source.name,
          reliability: source.reliability,
          matches
        };
      })
    );

    // Calculate weighted confidence
    const totalWeight = results.reduce((sum, r) => sum + r.reliability, 0);
    const weightedMatches = results.reduce((sum, r) => 
      sum + (r.matches ? r.reliability : 0), 0);
    
    const confidence = totalWeight > 0 ? weightedMatches / totalWeight : 0;

    return {
      claim,
      verified: confidence >= this.minConfidence,
      sources: results,
      confidence
    };
  }
}

// Example sources
const sources: Source[] = [
  {
    name: 'Wikipedia',
    reliability: 0.8,
    search: async (claim) => claim.toLowerCase().includes('typescript') // Simulated
  },
  {
    name: 'Official Docs',
    reliability: 0.95,
    search: async (claim) => claim.toLowerCase().includes('javascript') // Simulated
  },
  {
    name: 'Random Blog',
    reliability: 0.3,
    search: async () => Math.random() > 0.5 // Unreliable
  }
];

async function main() {
  const detector = new HallucinationDetector(sources, 0.7);

  const check1 = await detector.check('TypeScript is a superset of JavaScript');
  console.log('Fact check 1:', JSON.stringify(check1, null, 2));

  const check2 = await detector.check('Python was created by Guido van Rossum');
  console.log('Fact check 2:', JSON.stringify(check2, null, 2));
}

export { HallucinationDetector, FactCheck, Source };
