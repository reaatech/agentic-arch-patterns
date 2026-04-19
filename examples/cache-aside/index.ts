/**
 * Cache-Aside Pattern Example
 * 
 * Demonstrates response caching with invalidation.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheStore<T> {
  get(key: string): Promise<CacheEntry<T> | null>;
  set(key: string, value: T, ttl: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}

class CacheAside<T> {
  constructor(private store: CacheStore<T>, private defaultTtl: number) {}

  async get(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Try cache first
    const cached = await this.store.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`Cache hit: ${key}`);
      return cached.value;
    }

    // Fetch and cache
    console.log(`Cache miss: ${key}, fetching...`);
    const value = await fetcher();
    await this.store.set(key, value, this.defaultTtl);
    return value;
  }

  async invalidate(key: string): Promise<void> {
    await this.store.invalidate(key);
  }
}

// Simple in-memory cache store
function createMemoryCache<T>(): CacheStore<T> {
  const entries = new Map<string, CacheEntry<T>>();
  return {
    async get(key) { return entries.get(key) ?? null; },
    async set(key, value, ttl) {
      entries.set(key, { value, expiresAt: Date.now() + ttl });
    },
    async invalidate(key) { entries.delete(key); },
  };
}

const memoryCache: CacheStore<string> = createMemoryCache<string>();

async function main() {
  const cache = new CacheAside(memoryCache, 60000); // 1 minute TTL

  let fetchCount = 0;
  const expensiveFetch = async () => {
    fetchCount++;
    await new Promise(r => setTimeout(r, 100));
    return `Data #${fetchCount}`;
  };

  // First call - fetches
  const r1 = await cache.get('user:1', expensiveFetch);
  console.log('Result 1:', r1);

  // Second call - cached
  const r2 = await cache.get('user:1', expensiveFetch);
  console.log('Result 2:', r2);

  // After invalidation - fetches again
  await cache.invalidate('user:1');
  const r3 = await cache.get('user:1', expensiveFetch);
  console.log('Result 3:', r3);

  console.log('Total fetches:', fetchCount);
}

export { CacheAside, createMemoryCache };
export type { CacheStore, CacheEntry };
