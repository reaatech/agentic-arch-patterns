/**
 * Health Check Pattern Example
 * 
 * Demonstrates liveness and readiness probing.
 */

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: Record<string, { status: 'pass' | 'fail'; latency?: number; error?: string }>;
  timestamp: number;
}

interface HealthCheck {
  name: string;
  check(): Promise<{ status: 'pass' | 'fail'; latency?: number; error?: string }>;
}

class HealthChecker {
  private checks: HealthCheck[] = [];

  addCheck(check: HealthCheck): void {
    this.checks.push(check);
  }

  async check(): Promise<HealthStatus> {
    const results = await Promise.allSettled(
      this.checks.map(c => c.check())
    );

    const checks: Record<string, { status: 'pass' | 'fail'; latency?: number; error?: string }> = {};
    let allPass = true;
    let anyPass = false;

    this.checks.forEach((check, i) => {
      const result = results[i];
      if (!result) return;
      if (result.status === 'fulfilled') {
        checks[check.name] = result.value;
        if (result.value.status === 'pass') anyPass = true;
        else allPass = false;
      } else {
        const reason = result.reason;
        const message = reason instanceof Error ? reason.message : 'Unknown error';
        checks[check.name] = { status: 'fail', error: message };
        allPass = false;
      }
    });

    return {
      status: allPass ? 'healthy' : anyPass ? 'degraded' : 'unhealthy',
      checks,
      timestamp: Date.now()
    };
  }
}

/* v8 ignore next */
// Example health checks
const databaseCheck: HealthCheck = {
  name: 'database',
  check: async () => {
    const start = Date.now();
    await new Promise(r => setTimeout(r, 50)); // Simulate DB ping
    return { status: 'pass' as const, latency: Date.now() - start };
  }
};

const apiCheck: HealthCheck = {
  name: 'external-api',
  check: async () => {
    const start = Date.now();
    await new Promise(r => setTimeout(r, 100));
    return { status: 'pass' as const, latency: Date.now() - start };
  }
};

async function main() {
  const checker = new HealthChecker();
  checker.addCheck(databaseCheck);
  checker.addCheck(apiCheck);

  const health = await checker.check();
  console.log('Health status:', JSON.stringify(health, null, 2));
}

export { HealthChecker };
export type { HealthCheck, HealthStatus };
