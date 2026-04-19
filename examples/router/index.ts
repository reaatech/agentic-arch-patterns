/**
 * Router Pattern Example
 * 
 * Demonstrates content-based routing to specialized agents.
 */

interface Request {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
}

interface Response {
  requestId: string;
  result: string;
  agent: string;
}

interface Agent {
  type: string;
  canHandle(request: Request): boolean;
  process(request: Request): Promise<Response>;
}

interface RouterStrategy {
  route(request: Request, agents: Agent[]): Agent | null;
}

class Router {
  private agents: Agent[] = [];
  private strategy: RouterStrategy;

  constructor(strategy: RouterStrategy) {
    this.strategy = strategy;
  }

  registerAgent(agent: Agent): void {
    this.agents.push(agent);
  }

  async process(request: Request): Promise<Response> {
    const agent = this.strategy.route(request, this.agents);
    
    if (!agent) {
      throw new Error(`No suitable agent found for request: ${request.id}`);
    }

    console.log(`Routing request ${request.id} to agent: ${agent.type}`);
    return agent.process(request);
  }
}

/* v8 ignore next 44 */
// Example agents
const greetingAgent: Agent = {
  type: 'greeting',
  canHandle: (request) => /hello|hi|hey|good morning|good afternoon/i.test(request.content),
  process: async (request) => ({
    requestId: request.id,
    result: `Hello! How can I help you today?`,
    agent: 'greeting'
  })
};

const mathAgent: Agent = {
  type: 'math',
  canHandle: (request) => /\d+\s*[+\-*/]\s*\d+/.test(request.content),
  process: async (request) => {
    const match = request.content.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (match && match[1] && match[2] && match[3]) {
      const a = Number(match[1]);
      const op = match[2];
      const b = Number(match[3]);
      const operators: Record<string, number> = {
        '+': a + b,
        '-': a - b,
        '*': a * b,
        '/': b !== 0 ? a / b : NaN,
      };
      const result = operators[op] ?? NaN;
      return {
        requestId: request.id,
        result: `The answer is: ${result}`,
        agent: 'math'
      };
    }
    return {
      requestId: request.id,
      result: 'I could not parse the math expression',
      agent: 'math'
    };
  }
};

const defaultAgent: Agent = {
  type: 'general',
  canHandle: () => true,
  process: async (request) => ({
    requestId: request.id,
    result: `I'm a general assistant. You said: "${request.content}"`,
    agent: 'general'
  })
};

/* v8 ignore next 30 */
// Priority-based routing strategy
const priorityStrategy: RouterStrategy = {
  route: (request, agents) => {
    for (const agent of agents) {
      if (agent.canHandle(request)) {
        return agent;
      }
    }
    return null;
  }
};

// Demo usage
async function main() {
  const router = new Router(priorityStrategy);
  router.registerAgent(greetingAgent);
  router.registerAgent(mathAgent);
  router.registerAgent(defaultAgent);

  const requests: Request[] = [
    { id: '1', content: 'Hello there!' },
    { id: '2', content: 'What is 25 * 4?' },
    { id: '3', content: 'Tell me about history' }
  ];

  for (const request of requests) {
    const response = await router.process(request);
    console.log(`Response: ${response.result} (from ${response.agent})`);
  }
}

export { Router, Request, Response, Agent, RouterStrategy };
