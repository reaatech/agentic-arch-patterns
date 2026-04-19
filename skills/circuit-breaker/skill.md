# Circuit Breaker Pattern

> **Full chapter:** See [chapters/reliability/circuit-breaker.md](../../chapters/reliability/circuit-breaker.md) for the complete pattern description with architecture diagrams, formal properties, and implementation details.

## Quick Reference

**Problem:** Component failures cascade through distributed systems as requests pile up waiting for timeouts.

**Solution:** Monitor failures and open the circuit when a threshold is exceeded, rejecting requests immediately. After a cooldown period, test recovery with limited requests.

**Key Code:** See [examples/circuit-breaker/](../../examples/circuit-breaker/) for a runnable TypeScript implementation.

## Runnable Example

```bash
npx tsx examples/circuit-breaker/index.ts
```

## Cross-References

- **Retry with Backoff** (Part II) — Often composed with circuit breaker
- **Timeout** (Part II) — Circuit breaker complements timeout
- **Fallback Chain** (Part II) — Circuit breaker triggers fallback
- **Bulkhead** (Part II) — Isolation pattern that complements circuit breaker
- **agent-mesh** — `src/utils/circuitBreaker.ts` with Firestore persistence
