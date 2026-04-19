/**
 * Fallback Chain Pattern Example
 * 
 * Demonstrates graceful degradation through ordered alternatives.
 */

interface FallbackHandler<T> {
  name: string;
  execute(): Promise<T>;
}

class FallbackChain<T> {
  private handlers: FallbackHandler<T>[] = [];

  addHandler(handler: FallbackHandler<T>): void {
    this.handlers.push(handler);
  }

  async execute(): Promise<T> {
    let lastError: Error | undefined;

    for (const handler of this.handlers) {
      try {
        console.log(`Trying: ${handler.name}`);
        return await handler.execute();
      } catch (error) {
        lastError = error as Error;
        console.log(`Failed: ${handler.name}, trying next...`);
      }
    }

    throw new Error(`All fallbacks failed. Last error: ${lastError?.message}`);
  }
}

// Example fallback handlers
const primaryHandler: FallbackHandler<string> = {
  name: 'Primary API',
  execute: async () => {
    throw new Error('Primary API is down');
  }
};

const secondaryHandler: FallbackHandler<string> = {
  name: 'Secondary API',
  execute: async () => {
    throw new Error('Secondary API is also down');
  }
};

/* v8 ignore next 28 */
const cacheHandler: FallbackHandler<string> = {
  name: 'Cache',
  execute: async () => {
    return 'Cached response';
  }
};

const defaultHandler: FallbackHandler<string> = {
  name: 'Default Response',
  execute: async () => {
    return 'Sorry, service temporarily unavailable';
  }
};

async function main() {
  const chain = new FallbackChain<string>();
  chain.addHandler(primaryHandler);
  chain.addHandler(secondaryHandler);
  chain.addHandler(cacheHandler);
  chain.addHandler(defaultHandler);

  try {
    const result = await chain.execute();
    console.log('Result:', result);
  } catch (error) {
    console.log('Error:', error);
  }
}

export { FallbackChain, FallbackHandler };
