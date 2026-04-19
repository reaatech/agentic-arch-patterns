/**
 * Session Bypass Pattern Example
 * 
 * Demonstrates active session routing - skip classification for active sessions.
 */

interface Session {
  id: string;
  userId: string;
  context: Record<string, unknown>;
  lastActive: number;
  expiresAt: number;
}

interface SessionStore {
  get(sessionId: string): Promise<Session | null>;
  set(session: Session): Promise<void>;
}

interface Router {
  route(input: string): Promise<string>;
}

class SessionBypass {
  private readonly sessionTtlMs = 30 * 60 * 1000;

  constructor(
    private sessionStore: SessionStore,
    private router: Router
  ) {}

  async process(sessionId: string | null, input: string): Promise<{ result: string; sessionId: string }> {
    // Check for active session
    if (sessionId) {
      const session = await this.sessionStore.get(sessionId);
      if (session && session.expiresAt > Date.now()) {
        console.log(`Using active session: ${sessionId}`);
        const refreshedSession: Session = {
          ...session,
          context: { ...session.context, lastInput: input },
          lastActive: Date.now(),
          expiresAt: Date.now() + this.sessionTtlMs
        };
        await this.sessionStore.set(refreshedSession);
        // Bypass routing - continue with existing session context
        return {
          result: `Continuing session: ${input}`,
          sessionId: refreshedSession.id
        };
      }
    }

    // No active session - route normally
    console.log('Creating new session');
    const result = await this.router.route(input);
    const newSession: Session = {
      id: `session-${Date.now()}`,
      userId: 'user-1',
      context: { lastInput: input },
      lastActive: Date.now(),
      expiresAt: Date.now() + this.sessionTtlMs
    };
    await this.sessionStore.set(newSession);

    return { result, sessionId: newSession.id };
  }
}

// Example implementations
function createMemoryStore(): SessionStore {
  const sessions = new Map<string, Session>();
  return {
    async get(sessionId) { return sessions.get(sessionId) ?? null; },
    async set(session) { sessions.set(session.id, session); },
  };
}

const memoryStore: SessionStore = createMemoryStore();

const simpleRouter: Router = {
  async route(input: string) {
    return `Routed: ${input}`;
  }
};

async function main() {
  const bypass = new SessionBypass(memoryStore, simpleRouter);

  // First request - creates new session
  const result1 = await bypass.process(null, 'Hello');
  console.log('First request:', result1);

  // Second request - uses existing session
  const result2 = await bypass.process(result1.sessionId, 'Tell me more');
  console.log('Second request:', result2);
}

export { SessionBypass, createMemoryStore };
export type { Session, SessionStore, Router };
