import { describe, it, expect } from 'vitest';

import { ConfidenceGate } from '../examples/confidence-gate/index.js';
import { ConsensusVoting, majorityStrategy, type Judge } from '../examples/consensus-voting/index.js';
import { LLMJudge } from '../examples/llm-as-judge/index.js';
import { StructuredOutputValidator, type SchemaField } from '../examples/structured-output-validator/index.js';
import { HallucinationDetector, type Source } from '../examples/hallucination-detector/index.js';

describe('ConfidenceGate', () => {
  const gate = new ConfidenceGate({ highConfidenceThreshold: 0.8, lowConfidenceThreshold: 0.5 });

  it('routes above-threshold classifications directly', () => {
    expect(gate.route({ intent: 'x', confidence: 0.95 })).toBe('direct');
  });

  it('asks to clarify medium confidence', () => {
    expect(gate.route({ intent: 'x', confidence: 0.6 })).toBe('clarify');
  });

  it('escalates low confidence to human', () => {
    expect(gate.route({ intent: 'x', confidence: 0.2 })).toBe('human');
  });
});

describe('ConsensusVoting', () => {
  it('picks the majority option', async () => {
    const j = (id: string, pick: number): Judge => ({
      id,
      vote: async (options) => ({ option: options[pick]!, confidence: 1 }),
    });
    const v = new ConsensusVoting(majorityStrategy);
    v.addJudge(j('a', 0));
    v.addJudge(j('b', 0));
    v.addJudge(j('c', 1));
    expect(await v.decide(['A', 'B'])).toBe('A');
  });
});

describe('LLMJudge', () => {
  it('returns overallScore and a result per criterion', async () => {
    const judge = new LLMJudge({
      criteria: [
        { name: 'r', description: 'relevance', weight: 1 },
        { name: 'a', description: 'accuracy', weight: 2 },
      ],
      minScore: 0,
    });
    const result = await judge.evaluate('q', 'a');
    expect(result.results).toHaveLength(2);
    expect(typeof result.overallScore).toBe('number');
    expect(result.passed).toBe(true);
  });
});

describe('StructuredOutputValidator', () => {
  const schema: SchemaField[] = [
    { name: 'answer', type: 'string', required: true },
    { name: 'confidence', type: 'number', required: true, validation: (v) => typeof v === 'number' && v >= 0 && v <= 1 },
  ];
  const validator = new StructuredOutputValidator(schema);

  it('accepts valid objects', () => {
    expect(validator.validate({ answer: 'x', confidence: 0.5 }).valid).toBe(true);
  });

  it('rejects when required fields are missing', () => {
    const r = validator.validate({ answer: 'x' });
    expect(r.valid).toBe(false);
    expect(r.errors.find((e) => e.field === 'confidence')).toBeDefined();
  });

  it('rejects failed custom validation', () => {
    const r = validator.validate({ answer: 'x', confidence: 2 });
    expect(r.valid).toBe(false);
  });
});

describe('HallucinationDetector', () => {
  it('verifies claims when weighted sources agree', async () => {
    const sources: Source[] = [
      { name: 'hi', reliability: 1, search: async () => true },
      { name: 'lo', reliability: 0.1, search: async () => false },
    ];
    const d = new HallucinationDetector(sources, 0.6);
    const r = await d.check('claim');
    expect(r.verified).toBe(true);
  });

  it('flags unsupported claims', async () => {
    const sources: Source[] = [
      { name: 'hi', reliability: 1, search: async () => false },
    ];
    const d = new HallucinationDetector(sources, 0.5);
    const r = await d.check('claim');
    expect(r.verified).toBe(false);
  });
});
