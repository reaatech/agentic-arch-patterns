import { describe, it, expect } from 'vitest';

import { Orchestrator, type Worker, type Task } from '../examples/orchestrator-worker/index.js';
import { Supervisor, type WorkerAgent, type SupervisorAgent, type WorkItem } from '../examples/supervisor/index.js';
import { Pipeline, type PipelineStage } from '../examples/pipeline/index.js';
import { FanOutFanIn, type Worker as FOWorker, type Aggregator, type WorkItem as FOItem } from '../examples/fan-out-fan-in/index.js';
import { Router, type Agent, type RouterStrategy, type Request } from '../examples/router/index.js';

describe('Orchestrator-Worker', () => {
  it('routes tasks to matching workers', async () => {
    const o = new Orchestrator();
    const researchWorker: Worker = {
      type: 'research',
      process: async (task: Task) => ({ findings: [task.id] }),
    };
    o.registerWorker(researchWorker);
    const results = await o.execute([{ id: 'r1', type: 'research', payload: {} }]);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ findings: ['r1'] });
  });

  it('throws when no worker matches', async () => {
    const o = new Orchestrator();
    await expect(
      o.execute([{ id: 'x', type: 'analysis', payload: {} }]),
    ).rejects.toThrow(/No worker/);
  });
});

describe('Supervisor', () => {
  it('accepts high-confidence work', async () => {
    const worker: WorkerAgent = {
      id: 'w',
      capability: 0.9,
      process: async () => ({ result: 'OK', confidence: 0.9 }),
    };
    const supervisor: SupervisorAgent = {
      evaluate: async (r) => (r.confidence > 0.7 ? 'accept' : 'escalate'),
      escalate: async () => 'ESCALATED',
    };
    const s = new Supervisor(supervisor);
    s.addWorker(worker);
    const item: WorkItem = { id: '1', complexity: 'medium', content: 'hello' };
    expect(await s.process(item)).toBe('OK');
  });

  it('escalates low-confidence work', async () => {
    const worker: WorkerAgent = {
      id: 'w',
      capability: 0.9,
      process: async () => ({ result: 'OK', confidence: 0.1 }),
    };
    const supervisor: SupervisorAgent = {
      evaluate: async () => 'escalate',
      escalate: async () => 'HUMAN',
    };
    const s = new Supervisor(supervisor);
    s.addWorker(worker);
    const item: WorkItem = { id: '2', complexity: 'low', content: 'h' };
    expect(await s.process(item)).toBe('HUMAN');
  });
});

describe('Pipeline', () => {
  it('executes stages in order', async () => {
    const p = new Pipeline();
    const order: string[] = [];
    const stage = (name: string): PipelineStage => ({
      name,
      process: async (ctx) => {
        order.push(name);
        return ctx;
      },
    });
    p.addStage(stage('a'));
    p.addStage(stage('b'));
    p.addStage(stage('c'));
    await p.execute({});
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('collects errors and stops', async () => {
    const p = new Pipeline();
    p.addStage({
      name: 'boom',
      process: async () => {
        throw new Error('kaboom');
      },
    });
    const result = await p.execute({});
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toBe('kaboom');
  });
});

describe('FanOutFanIn', () => {
  it('distributes and aggregates', async () => {
    const worker: FOWorker = {
      id: 'w1',
      process: async (item: FOItem) => ({
        itemId: item.id,
        result: `r-${String(item.data)}`,
        duration: 1,
      }),
    };
    const agg: Aggregator<string[]> = {
      aggregate: async (results) => results.map((r) => r.result as string),
    };
    const ff = new FanOutFanIn<string[]>(agg);
    ff.addWorker(worker);
    const out = await ff.execute([
      { id: '1', data: 'a' },
      { id: '2', data: 'b' },
    ]);
    expect(out).toEqual(['r-a', 'r-b']);
  });

  it('throws without workers', async () => {
    const agg: Aggregator<number> = { aggregate: async () => 0 };
    const ff = new FanOutFanIn<number>(agg);
    await expect(ff.execute([{ id: '1', data: null }])).rejects.toThrow();
  });
});

describe('Router', () => {
  it('selects the first matching agent', async () => {
    const hello: Agent = {
      type: 'hello',
      canHandle: (r: Request) => /hi/.test(r.content),
      process: async (r: Request) => ({ requestId: r.id, result: 'yo', agent: 'hello' }),
    };
    const fallback: Agent = {
      type: 'fallback',
      canHandle: () => true,
      process: async (r: Request) => ({ requestId: r.id, result: 'fallback', agent: 'fallback' }),
    };
    const strategy: RouterStrategy = {
      route: (req, agents) => agents.find((a) => a.canHandle(req)) ?? null,
    };
    const r = new Router(strategy);
    r.registerAgent(hello);
    r.registerAgent(fallback);
    const response = await r.process({ id: '1', content: 'hi' });
    expect(response.agent).toBe('hello');
  });

  it('throws when no agent matches', async () => {
    const strategy: RouterStrategy = { route: () => null };
    const r = new Router(strategy);
    await expect(r.process({ id: '1', content: 'x' })).rejects.toThrow(/No suitable/);
  });

  it('routes math expressions to math agent', async () => {
    const mathAgent: Agent = {
      type: 'math',
      canHandle: (r: Request) => /\d+\s*[+\-*/]\s*\d+/.test(r.content),
      process: async (r: Request) => ({
        requestId: r.id,
        result: `expr: ${r.content}`,
        agent: 'math'
      }),
    };
    const defaultAgent: Agent = {
      type: 'general',
      canHandle: () => true,
      process: async (r: Request) => ({ requestId: r.id, result: 'fallback', agent: 'general' }),
    };
    const strategy: RouterStrategy = {
      route: (req, agents) => agents.find((a) => a.canHandle(req)) ?? null,
    };
    const r = new Router(strategy);
    r.registerAgent(mathAgent);
    r.registerAgent(defaultAgent);
    const response = await r.process({ id: '1', content: '25 + 4' });
    expect(response.agent).toBe('math');
  });

  it('defaults to general agent for unrecognized input', async () => {
    const greetingAgent: Agent = {
      type: 'greeting',
      canHandle: (r: Request) => /hello/i.test(r.content),
      process: async (r: Request) => ({ requestId: r.id, result: 'hi', agent: 'greeting' }),
    };
    const defaultAgent: Agent = {
      type: 'general',
      canHandle: () => true,
      process: async (r: Request) => ({ requestId: r.id, result: 'general', agent: 'general' }),
    };
    const strategy: RouterStrategy = {
      route: (req, agents) => agents.find((a) => a.canHandle(req)) ?? null,
    };
    const r = new Router(strategy);
    r.registerAgent(greetingAgent);
    r.registerAgent(defaultAgent);
    const response = await r.process({ id: '1', content: 'Tell me a story' });
    expect(response.agent).toBe('general');
  });
});
