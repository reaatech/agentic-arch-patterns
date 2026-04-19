import { describe, it, expect } from 'vitest';

import { TokenBudgetEnforcer } from '../examples/token-budget-enforcer/index.js';
import { SpeculativeExecutor, type SelectionStrategy } from '../examples/speculative-execution/index.js';
import { CacheAside, createMemoryCache } from '../examples/cache-aside/index.js';
import { BatchCoalescer } from '../examples/batch-coalescing/index.js';
import { GracefulDegradation, type QualityLevel } from '../examples/graceful-degradation/index.js';

describe('TokenBudgetEnforcer', () => {
  it('subtracts used tokens and reports remaining', async () => {
    const e = new TokenBudgetEnforcer(1000);
    await e.execute(async () => ({ result: 'ok', tokens: 200 }));
    expect(e.getRemaining()).toBe(800);
  });

  it('throws when the budget would be exceeded', async () => {
    const e = new TokenBudgetEnforcer(50);
    await expect(e.execute(async () => ({ result: 'ok', tokens: 10 }), 100)).rejects.toThrow(/exceeded/);
  });
});

describe('SpeculativeExecutor', () => {
  it('returns the candidate chosen by the strategy', async () => {
    const strategy: SelectionStrategy<string> = {
      select: async (candidates) => candidates[0]!,
    };
    const exec = new SpeculativeExecutor<string>(strategy);
    const out = await exec.execute([async () => 'first', async () => 'second']);
    expect(out.result).toBe('first');
  });
});

describe('CacheAside', () => {
  it('caches results on first fetch', async () => {
    const cache = new CacheAside(createMemoryCache<string>(), 60_000);
    let fetches = 0;
    const fetcher = async () => { fetches++; return `v${fetches}`; };
    expect(await cache.get('k', fetcher)).toBe('v1');
    expect(await cache.get('k', fetcher)).toBe('v1');
    expect(fetches).toBe(1);
  });

  it('re-fetches after invalidate', async () => {
    const cache = new CacheAside(createMemoryCache<string>(), 60_000);
    let fetches = 0;
    const fetcher = async () => { fetches++; return `v${fetches}`; };
    await cache.get('k', fetcher);
    await cache.invalidate('k');
    expect(await cache.get('k', fetcher)).toBe('v2');
  });
});

describe('BatchCoalescer', () => {
  it('batches items until maxSize is reached', async () => {
    const batches: number[] = [];
    const coalescer = new BatchCoalescer<number, number>(
      async (items) => {
        batches.push(items.length);
        return items.map((x) => x * 2);
      },
      { maxSize: 2, maxWaitMs: 5_000 },
    );
    const results = await Promise.all([coalescer.add(1), coalescer.add(2)]);
    expect(results).toEqual([2, 4]);
    expect(batches).toEqual([2]);
  });

  it('flushes after maxWaitMs', async () => {
    const coalescer = new BatchCoalescer<number, number>(
      async (items) => items.map((x) => x + 1),
      { maxSize: 100, maxWaitMs: 10 },
    );
    expect(await coalescer.add(5)).toBe(6);
  });
});

describe('GracefulDegradation', () => {
  const levels: QualityLevel[] = [
    { name: 'high', maxConcurrentRequests: 1, features: ['all'] },
    { name: 'low', maxConcurrentRequests: 100, features: [] },
  ];

  it('starts at the highest quality level', () => {
    const g = new GracefulDegradation(levels);
    expect(g.getCurrentLevel().name).toBe('high');
  });

  it('requires at least one level', () => {
    expect(() => new GracefulDegradation([])).toThrow();
  });

  it('executes operation and returns result', async () => {
    const g = new GracefulDegradation(levels);
    const result = await g.execute(async () => 'success');
    expect(result).toBe('success');
  });

  it('reports current quality level features', () => {
    const g = new GracefulDegradation(levels);
    expect(g.getCurrentLevel().features).toEqual(['all']);
  });

  it('cannot upgrade beyond highest level', () => {
    const twoLevel: QualityLevel[] = [
      { name: 'high', maxConcurrentRequests: 1, features: ['a'] },
      { name: 'low', maxConcurrentRequests: 2, features: [] },
    ];
    const g = new GracefulDegradation(twoLevel);
    expect(g.getCurrentLevel().name).toBe('high');
  });
});
