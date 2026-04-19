/**
 * Audit Trail Pattern Example
 * 
 * Demonstrates immutable operation logging for compliance.
 */

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditTrailOptions {
  service: string;
  immutable: boolean;
}

class AuditTrail {
  private events: AuditEvent[] = [];
  private options: AuditTrailOptions;

  constructor(options: AuditTrailOptions) {
    this.options = options;
  }

  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const auditEvent: AuditEvent = {
      ...cloneAuditEvent(event),
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const storedEvent = this.options.immutable ? deepFreeze(cloneAuditEvent(auditEvent)) : cloneAuditEvent(auditEvent);
    this.events.push(storedEvent);
    console.log(`[AUDIT] ${auditEvent.timestamp} - ${auditEvent.actor} performed ${auditEvent.action} on ${auditEvent.resource}`);

    return cloneAuditEvent(storedEvent);
  }

  query(filters: Partial<AuditEvent>): AuditEvent[] {
    return this.events.filter(event => {
      for (const [key, value] of Object.entries(filters)) {
        if (event[key as keyof AuditEvent] !== value) {
          return false;
        }
      }
      return true;
    }).map((event) => cloneAuditEvent(event));
  }

  getEvents(): AuditEvent[] {
    return this.events.map((event) => cloneAuditEvent(event));
  }
}

function cloneAuditEvent<T>(value: T): T {
  return structuredClone(value);
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  Object.freeze(value);

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }

  return value;
}

/* v8 ignore next 33 */
async function main() {
  const audit = new AuditTrail({ service: 'chat-agent', immutable: true });

  // Log various events
  audit.log({
    actor: 'user-123',
    action: 'login',
    resource: 'system',
    details: { method: 'oauth' },
    ipAddress: '192.168.1.100'
  });

  audit.log({
    actor: 'user-123',
    action: 'send_message',
    resource: 'conversation-456',
    details: { messageLength: 42 }
  });

  audit.log({
    actor: 'system',
    action: 'rate_limit_exceeded',
    resource: 'user-789',
    details: { limit: 100, current: 150 }
  });

  // Query events
  const userEvents = audit.query({ actor: 'user-123' });
  console.log('\nEvents for user-123:', userEvents.length);

  const allEvents = audit.getEvents();
  console.log('Total events:', allEvents.length);
}

export { AuditTrail, AuditEvent, AuditTrailOptions };
