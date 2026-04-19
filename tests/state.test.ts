import { describe, it, expect } from 'vitest';

import { SessionBypass, createMemoryStore as createSessionStore, type Router as SessionRouter } from '../examples/session-bypass/index.js';
import { IdempotencyCache } from '../examples/idempotency-cache/index.js';
import { ReplayBuffer } from '../examples/replay-buffer/index.js';
import { CheckpointManager, createMemoryStore as createCheckpointStore } from '../examples/checkpoint/index.js';
import { Saga, type SagaStep } from '../examples/saga/index.js';

describe('SessionBypass', () => {
  const router: SessionRouter = { route: async (input) => `routed:${input}` };

  it('routes when there is no active session', async () => {
    const b = new SessionBypass(createSessionStore(), router);
    const out = await b.process(null, 'hi');
    expect(out.result).toBe('routed:hi');
    expect(out.sessionId).toBeDefined();
  });

  it('reuses active sessions', async () => {
    const b = new SessionBypass(createSessionStore(), router);
    const first = await b.process(null, 'hi');
    const second = await b.process(first.sessionId, 'more');
    expect(second.sessionId).toBe(first.sessionId);
    expect(second.result).toContain('Continuing');
  });

  it('refreshes session activity and expiry on reuse', async () => {
    const store = createSessionStore();
    const b = new SessionBypass(store, router);
    const first = await b.process(null, 'hi');
    const original = await store.get(first.sessionId);
    await new Promise((r) => setTimeout(r, 5));
    await b.process(first.sessionId, 'more');
    const refreshed = await store.get(first.sessionId);

    expect(original).not.toBeNull();
    expect(refreshed).not.toBeNull();
    expect(refreshed?.lastActive).toBeGreaterThan(original!.lastActive);
    expect(refreshed?.expiresAt).toBeGreaterThan(original!.expiresAt);
    expect(refreshed?.context.lastInput).toBe('more');
  });
});

describe('IdempotencyCache', () => {
  it('executes once per key within TTL', async () => {
    const cache = new IdempotencyCache({ ttl: 1000 });
    let n = 0;
    const op = async () => ++n;
    expect(await cache.getOrExecute('k', op)).toBe(1);
    expect(await cache.getOrExecute('k', op)).toBe(1);
    expect(await cache.getOrExecute('k2', op)).toBe(2);
  });

  it('re-executes after TTL expires', async () => {
    const cache = new IdempotencyCache({ ttl: 1 });
    let n = 0;
    await cache.getOrExecute('k', async () => ++n);
    await new Promise((r) => setTimeout(r, 5));
    await cache.getOrExecute('k', async () => ++n);
    expect(n).toBe(2);
  });

  it('deduplicates concurrent requests for the same key', async () => {
    const cache = new IdempotencyCache({ ttl: 1000 });
    let executions = 0;
    const op = async () => {
      executions++;
      await new Promise((r) => setTimeout(r, 20));
      return executions;
    };

    const [first, second] = await Promise.all([
      cache.getOrExecute('k', op),
      cache.getOrExecute('k', op),
    ]);

    expect(first).toBe(1);
    expect(second).toBe(1);
    expect(executions).toBe(1);
  });
});

describe('ReplayBuffer', () => {
  it('trims oldest messages when over capacity', () => {
    const b = new ReplayBuffer({ maxMessages: 2 });
    b.addMessage({ role: 'user', content: 'a', timestamp: 1 });
    b.addMessage({ role: 'user', content: 'b', timestamp: 2 });
    b.addMessage({ role: 'user', content: 'c', timestamp: 3 });
    const msgs = b.getMessages();
    expect(msgs).toHaveLength(2);
    expect(msgs.map((m) => m.content)).toEqual(['b', 'c']);
  });

  it('clear empties the buffer', () => {
    const b = new ReplayBuffer({ maxMessages: 5 });
    b.addMessage({ role: 'user', content: 'a', timestamp: 1 });
    b.clear();
    expect(b.getMessages()).toHaveLength(0);
  });
});

describe('CheckpointManager', () => {
  it('saves and restores state', async () => {
    const mgr = new CheckpointManager(createCheckpointStore());
    const id = await mgr.createCheckpoint({ counter: 42 });
    const restored = await mgr.restore(id);
    expect(restored).toMatchObject({ counter: 42 });
  });

  it('returns null for unknown ids', async () => {
    const mgr = new CheckpointManager(createCheckpointStore());
    expect(await mgr.restore('missing')).toBeNull();
  });
});

describe('Saga', () => {
  it('compensates completed steps on failure', async () => {
    type Ctx = { a: boolean; b: boolean };
    const saga = new Saga<Ctx>();
    const compensated: string[] = [];
    const stepA: SagaStep<Ctx> = {
      name: 'A',
      execute: async (ctx) => { ctx.a = true; },
      compensate: async () => { compensated.push('A'); },
    };
    const stepB: SagaStep<Ctx> = {
      name: 'B',
      execute: async () => { throw new Error('boom'); },
      compensate: async () => { compensated.push('B'); },
    };
    saga.addStep(stepA);
    saga.addStep(stepB);
    await expect(saga.execute({ a: false, b: false })).rejects.toThrow('boom');
    expect(compensated).toContain('A');
  });

  it('completes successfully when all steps succeed', async () => {
    type Ctx = { a: boolean; b: boolean };
    const saga = new Saga<Ctx>();
    const compensated: string[] = [];
    const stepA: SagaStep<Ctx> = {
      name: 'A',
      execute: async (ctx) => { ctx.a = true; return 'resultA'; },
      compensate: async () => { compensated.push('A'); },
    };
    const stepB: SagaStep<Ctx> = {
      name: 'B',
      execute: async (ctx) => { ctx.b = true; return 'resultB'; },
      compensate: async () => { compensated.push('B'); },
    };
    saga.addStep(stepA);
    saga.addStep(stepB);
    const result = await saga.execute({ a: false, b: false });
    expect(result.a).toBe(true);
    expect(result.b).toBe(true);
    expect(compensated).toHaveLength(0);
  });

  it('handles compensation failure gracefully', async () => {
    type Ctx = { a: boolean };
    const saga = new Saga<Ctx>();
    const stepA: SagaStep<Ctx> = {
      name: 'A',
      execute: async (ctx) => { ctx.a = true; },
      compensate: async () => { throw new Error('compensate failed'); },
    };
    const stepB: SagaStep<Ctx> = {
      name: 'B',
      execute: async () => { throw new Error('boom'); },
      compensate: async () => {},
    };
    saga.addStep(stepA);
    saga.addStep(stepB);
    await expect(saga.execute({ a: false })).rejects.toThrow('boom');
  });
});
