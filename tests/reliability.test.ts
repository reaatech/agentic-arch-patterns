import { describe, it, expect } from 'vitest';

import { CircuitBreaker } from '../examples/circuit-breaker/index.js';
import { RetryWithBackoff } from '../examples/retry-backoff/index.js';
import { FallbackChain, type FallbackHandler } from '../examples/fallback-chain/index.js';
import { Bulkhead } from '../examples/bulkhead/index.js';
import { withTimeout, TimeoutError } from '../examples/timeout/index.js';

describe('CircuitBreaker', () => {
  it('opens after the threshold is reached', async () => {
    const cb = new CircuitBreaker({ threshold: 2, resetTimeout: 1000 });
    const fail = async () => {
      throw new Error('nope');
    };
    await expect(cb.execute(fail)).rejects.toThrow();
    await expect(cb.execute(fail)).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');
    await expect(cb.execute(async () => 'never')).rejects.toThrow(/OPEN/);
  });

  it('resets to CLOSED after success in HALF_OPEN', async () => {
    const cb = new CircuitBreaker({ threshold: 1, resetTimeout: 10 });
    await expect(cb.execute(async () => { throw new Error('e'); })).rejects.toThrow();
    expect(cb.getState()).toBe('OPEN');
    await new Promise((r) => setTimeout(r, 20));
    await cb.execute(async () => 'ok');
    await cb.execute(async () => 'ok');
    expect(cb.getState()).toBe('CLOSED');
  });
});

describe('RetryWithBackoff', () => {
  it('retries until success', async () => {
    const retry = new RetryWithBackoff({ maxRetries: 3, baseDelay: 1, maxDelay: 5, jitter: false });
    let attempts = 0;
    const result = await retry.execute(async () => {
      attempts++;
      if (attempts < 3) throw new Error('transient');
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('throws after exhausting retries', async () => {
    const retry = new RetryWithBackoff({ maxRetries: 2, baseDelay: 1, maxDelay: 2, jitter: false });
    await expect(retry.execute(async () => { throw new Error('boom'); })).rejects.toThrow('boom');
  });

  it('applies jitter when enabled', async () => {
    const retry = new RetryWithBackoff({ maxRetries: 1, baseDelay: 10, maxDelay: 50, jitter: true });
    let attempts = 0;
    await expect(retry.execute(async () => {
      attempts++;
      throw new Error('fail');
    })).rejects.toThrow('fail');
    expect(attempts).toBe(2);
  });

  it('caps delay at maxDelay', async () => {
    const retry = new RetryWithBackoff({ maxRetries: 5, baseDelay: 100, maxDelay: 150, jitter: false });
    let attempts = 0;
    await expect(retry.execute(async () => {
      attempts++;
      throw new Error('always fails');
    })).rejects.toThrow('always fails');
    expect(attempts).toBe(6);
  });
});

describe('FallbackChain', () => {
  it('returns the first handler that succeeds', async () => {
    const chain = new FallbackChain<string>();
    const bad: FallbackHandler<string> = { name: 'bad', execute: async () => { throw new Error('x'); } };
    const good: FallbackHandler<string> = { name: 'good', execute: async () => 'yes' };
    chain.addHandler(bad);
    chain.addHandler(good);
    expect(await chain.execute()).toBe('yes');
  });

  it('throws when every handler fails', async () => {
    const chain = new FallbackChain<string>();
    chain.addHandler({ name: 'a', execute: async () => { throw new Error('a'); } });
    chain.addHandler({ name: 'b', execute: async () => { throw new Error('b'); } });
    await expect(chain.execute()).rejects.toThrow(/All fallbacks failed/);
  });
});

describe('Bulkhead', () => {
  it('caps concurrency and queues the rest', async () => {
    const bh = new Bulkhead({ maxConcurrent: 2 });
    let active = 0;
    let peak = 0;
    const task = () => bh.execute(async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 20));
      active--;
      return 'done';
    });
    await Promise.all([task(), task(), task(), task()]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});

describe('withTimeout', () => {
  it('resolves when the operation finishes in time', async () => {
    const r = await withTimeout(async () => 'fast', { timeout: 100 });
    expect(r).toBe('fast');
  });

  it('rejects with TimeoutError when the operation exceeds the bound', async () => {
    await expect(
      withTimeout(async () => { await new Promise((r) => setTimeout(r, 50)); return 'slow'; }, { timeout: 5, operationName: 'op' }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });

  it('TimeoutError has correct message format', () => {
    const err = new TimeoutError('myOp', 500);
    expect(err.message).toBe("Operation 'myOp' timed out after 500ms");
    expect(err.name).toBe('TimeoutError');
  });

  it('uses default operation name when not provided', async () => {
    await expect(
      withTimeout(async () => { await new Promise((r) => setTimeout(r, 50)); }, { timeout: 5 }),
    ).rejects.toThrow("Operation 'anonymous' timed out");
  });
});
