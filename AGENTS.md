# AGENTS.md — agentic-arch-patterns

## What This Is

This document provides guidance for applying the architectural patterns documented in this catalog to real-world agentic systems. It serves as a bridge between abstract pattern descriptions and concrete implementation, helping engineers select, compose, and adapt patterns for their specific contexts.

**Target audience:** Engineers building production multi-agent systems, platform architects designing agent infrastructure, SREs operating agent systems at scale, and technical leaders evaluating agentic architectures.

---

## How to Use This Pattern Catalog

### Step 1: Identify Your Problem Domain

Start by identifying which aspect of your system needs improvement:

| If you need to... | Start with Part |
|-------------------|-----------------|
| Coordinate multiple agents | I: Orchestration Patterns |
| Handle failures gracefully | II: Reliability Patterns |
| Maintain conversation state | III: State Management Patterns |
| Ensure output quality | IV: Quality Patterns |
| Protect against attacks | V: Security Patterns |
| Optimize performance | VI: Performance Patterns |
| Monitor and debug | VII: Observability Patterns |

### Step 2: Use the Decision Tree

Navigate to `ARCHITECTURE.md` and follow the decision tree to identify relevant patterns. The tree guides you through a series of questions to narrow down the most appropriate patterns for your use case.

### Step 3: Read the Pattern Chapter

Each pattern chapter provides:

1. **Problem Statement** — Formal definition of the problem
2. **Context** — When this problem arises
3. **Forces** — Competing concerns that shape the solution
4. **Solution** — Architecture, components, and interaction sequence
5. **Implementation** — Complete TypeScript example
6. **Failure Modes** — What can go wrong and how to recover
7. **When NOT to Use** — Anti-pattern guidance

### Step 4: Review Cross-References

Patterns are often composed together. Review the cross-references section to understand:

- **Related Patterns** — Patterns that complement this one
- **Alternative Patterns** — Patterns that solve similar problems differently
- **External Implementations** — Reference implementations in related repos

### Step 5: Adapt to Your Context

The patterns are templates, not prescriptions. Adapt them to your specific:

- Technology stack
- Scale requirements
- Regulatory constraints
- Organizational capabilities

---

## Pattern Selection Guide

### For Multi-Agent Orchestration

**Scenario:** Building a system with multiple specialized agents that need coordination.

**Recommended Patterns:**
1. **Orchestrator-Worker** — Central coordination with task distribution
2. **Router** — Content-based routing to specialized agents
3. **Confidence Gate** — Threshold-based routing decisions
4. **Session Bypass** — Maintain conversation continuity

**Composition:**
```
Client Request → Router → Confidence Gate → Orchestrator-Worker
                         ↓
                    Session Bypass (for active sessions)
```

**Reference Implementation:** See `agent-mesh` for a complete orchestrator implementation.

### For High Reliability

**Scenario:** Building a system that must remain available despite component failures.

**Recommended Patterns:**
1. **Circuit Breaker** — Fail fast when components are unhealthy
2. **Retry with Backoff** — Handle transient failures gracefully
3. **Fallback Chain** — Degrade through alternatives
4. **Bulkhead** — Isolate failures to prevent cascading
5. **Timeout** — Bound waiting time

**Composition:**
```
Request → Timeout → Circuit Breaker → Retry with Backoff → Fallback Chain
                                      ↓
                                 Bulkhead (resource isolation)
```

**Reference Implementation:** See `agent-mesh` `src/utils/circuitBreaker.ts` for circuit breaker implementation.

### For Quality Assurance

**Scenario:** Ensuring agent outputs meet quality standards.

**Recommended Patterns:**
1. **Structured Output Validator** — Enforce output schemas
2. **LLM-as-Judge** — Automated quality evaluation
3. **Consensus Voting** — Multiple judges for critical decisions
4. **Hallucination Detector** — Fact verification

**Composition:**
```
Agent Output → Structured Output Validator → LLM-as-Judge → Consensus Voting
                                              ↓
                                         Hallucination Detector
```

**Reference Implementation:** See `classifier-evals` `src/judge/` for LLM-as-judge implementation.

### For Cost Optimization

**Scenario:** Controlling LLM API costs while maintaining quality.

**Recommended Patterns:**
1. **Token Budget Enforcer** — Allocate and enforce token budgets
2. **Cache-Aside** — Avoid redundant API calls
3. **Graceful Degradation** — Reduce quality under budget pressure
4. **LLM-as-Judge** — Use cheap models with expensive verification

**Composition:**
```
Request → Token Budget Enforcer → Cache-Aside → Agent
                               ↓
                          Graceful Degradation (if budget exceeded)
```

**Reference Implementation:** See `llm-router` `src/telemetry/budget-manager.ts` for budget enforcement.

### For Security

**Scenario:** Protecting against prompt injection and data leakage.

**Recommended Patterns:**
1. **Prompt-Injection Sanitizer** — Validate and sanitize inputs
2. **PII Redactor** — Mask sensitive data
3. **Tool Permission Gateway** — Control tool access
4. **Audit Trail** — Log operations for compliance

**Composition:**
```
Input → Prompt-Injection Sanitizer → PII Redactor → Agent
                                     ↓
                              Tool Permission Gateway
                                     ↓
                                Audit Trail
```

---

## Adapting Patterns to Your Context

### Technology Stack Considerations

**Node.js/TypeScript:**
- Use the provided TypeScript examples directly
- Leverage Zod for schema validation
- Use pino for structured logging
- Use OpenTelemetry for distributed tracing

**Python:**
- Adapt TypeScript examples to Python
- Use Pydantic for schema validation
- Use structlog for structured logging
- Use OpenTelemetry Python for tracing

**Go:**
- Adapt patterns to Go's concurrency model
- Use Go's standard library for most patterns
- Use OpenTelemetry Go for tracing

### Scale Considerations

**Small Scale (< 1000 req/day):**
- Focus on correctness over performance
- Use simpler patterns (Timeout, Retry)
- Defer complex patterns (Circuit Breaker, Bulkhead)

**Medium Scale (1K-100K req/day):**
- Implement core reliability patterns
- Add observability patterns
- Consider cost optimization

**Large Scale (> 100K req/day):**
- All reliability patterns essential
- Performance patterns critical
- Full observability stack required

### Regulatory Considerations

**Healthcare (HIPAA):**
- Audit Trail is mandatory
- PII Redactor is mandatory
- Session Bypass must ensure data isolation
- Checkpoint for disaster recovery

**Finance (SOX, PCI-DSS):**
- Audit Trail is mandatory
- Tool Permission Gateway for access control
- Multi-Key Rotation for key management
- Structured Logging for compliance reporting

**General Data Protection (GDPR):**
- PII Redactor for data minimization
- Right to deletion (Checkpoint cleanup)
- Audit Trail for accountability
- Session Bypass with data isolation

---

## Common Composition Patterns

### The Complete Production System

A production-grade agentic system typically composes patterns from all categories:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Gateway Layer                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │ Prompt-     │    │ PII         │    │ Tool        │              │
│  │ Injection   │    │ Redactor    │    │ Permission  │              │
│  │ Sanitizer   │    │             │    │ Gateway     │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                       │
│         └──────────────────┼──────────────────┘                       │
│                            ▼                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │ Router      │    │ Confidence  │    │ Session     │              │
│  │             │    │ Gate        │    │ Bypass      │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                       │
│         └──────────────────┼──────────────────┘                       │
│                            ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Orchestration Layer                       │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │    │
│  │  │ Circuit     │    │ Retry with  │    │ Fallback    │      │    │
│  │  │ Breaker     │    │ Backoff     │    │ Chain       │      │    │
│  │  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      │    │
│  │         │                  │                  │              │    │
│  │         └──────────────────┼──────────────────┘              │    │
│  │                            ▼                                │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │    │
│  │  │ Token       │    │ Structured  │    │ LLM-as-     │      │    │
│  │  │ Budget      │    │ Output      │    │ Judge       │      │    │
│  │  │ Enforcer    │    │ Validator   │    │             │      │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                            ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Observability Layer                       │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │    │
│  │  │ Distributed │    │ Structured  │    │ Metrics     │      │    │
│  │  │ Tracing     │    │ Logging     │    │ Aggregation │      │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### The Minimal Viable System

For early-stage systems, start with these essential patterns:

1. **Timeout** — Prevent unbounded waiting
2. **Retry with Backoff** — Handle transient failures
3. **Structured Logging** — Enable debugging
4. **Structured Output Validator** — Ensure output correctness

Add other patterns as your system scales and requirements mature.

---

## Integration with Related Repositories

This pattern catalog is designed to work alongside your other repositories:

### agent-mesh

**What it provides:** Complete multi-agent orchestration implementation.

**Patterns implemented:**
- Router (classifier + confidence gate)
- Circuit Breaker (per-agent)
- Session Bypass (Firestore-backed)
- Structured Logging (Winston + OTel)
- Distributed Tracing (OpenTelemetry)

**How to use:** Reference the implementation when applying these patterns. The code serves as a concrete example of the abstract patterns.

### mcp-contract-kit

**What it provides:** Conformance testing for MCP servers.

**Patterns implemented:**
- Structured Output Validator (protocol compliance)
- Health Check (deep health endpoints)
- Structured Logging (test result reporting)

**How to use:** Use contract-kit to validate that your agents implement the patterns correctly.

### llm-router

**What it provides:** Cost-aware LLM routing.

**Patterns implemented:**
- Token Budget Enforcer (budget management)
- Fallback Chain (model failover)
- Cache-Aside (response caching)
- Graceful Degradation (quality reduction)

**How to use:** Integrate llm-router as a component when you need cost-aware routing.

### classifier-evals

**What it provides:** Evaluation harness for intent classification.

**Patterns implemented:**
- LLM-as-Judge (quality evaluation)
- Structured Output Validator (schema validation)
- Metrics Aggregation (evaluation metrics)

**How to use:** Use classifier-evals to evaluate your classification systems and apply quality patterns based on results.

---

## Anti-Patterns to Avoid

### The God Agent

**Description:** A single agent that handles all tasks with hundreds of tools.

**Why it's bad:** Unmaintainable, slow, error-prone, violates separation of concerns.

**Remedy:** Apply Orchestrator-Worker or Router pattern to decompose into specialized agents.

### The Retry Storm

**Description:** Unbounded retries without backoff or jitter.

**Why it's bad:** Exponential traffic amplification during outages, prolonged recovery.

**Remedy:** Apply Retry with Backoff pattern with exponential backoff and jitter.

### Blind Trust

**Description:** Accepting LLM output without any validation.

**Why it's bad:** Hallucinations, schema violations, incorrect information.

**Remedy:** Apply Structured Output Validator and Hallucination Detector patterns.

### Prompt Injection

**Description:** User input directly concatenated into prompts without sanitization.

**Why it's bad:** Jailbreaking, data exfiltration, system compromise.

**Remedy:** Apply Prompt-Injection Sanitizer pattern.

### Token Profligacy

**Description:** No token counting or budgeting.

**Why it's bad:** Cost overruns, quota exhaustion, unpredictable bills.

**Remedy:** Apply Token Budget Enforcer pattern.

---

## Best Practices

### Start Simple, Add Complexity Gradually

1. **Phase 1:** Implement core functionality with basic error handling
2. **Phase 2:** Add reliability patterns (Timeout, Retry)
3. **Phase 3:** Add observability (Structured Logging, Distributed Tracing)
4. **Phase 4:** Add quality patterns (Structured Output Validator)
5. **Phase 5:** Add advanced patterns based on specific needs

### Test Patterns in Isolation

Before composing patterns, test each pattern individually:

1. Unit test the pattern implementation
2. Integration test with mock dependencies
3. Chaos test by injecting failures
4. Load test to verify performance characteristics

### Monitor Pattern Effectiveness

For each pattern you implement, define metrics to measure its effectiveness:

| Pattern | Metric | Target |
|---------|--------|--------|
| Circuit Breaker | Failure rate reduction | >50% |
| Retry with Backoff | Recovery time | <30s |
| Cache-Aside | Hit rate | >80% |
| Token Budget Enforcer | Cost variance | <10% |
| Structured Output Validator | Schema violation rate | <1% |

### Document Pattern Decisions

For each pattern you apply, document:

- **Why** this pattern was chosen
- **How** it was adapted to your context
- **What** tradeoffs were made
- **When** it should be revisited

This documentation helps future maintainers understand the system's architecture.

---

## Checklist: Production Readiness

Before deploying an agentic system to production, verify:

### Reliability
- [ ] Timeout pattern implemented for all external calls
- [ ] Retry with Backoff configured with appropriate limits
- [ ] Circuit Breaker protecting against cascading failures
- [ ] Fallback Chain for graceful degradation

### State Management
- [ ] Session Bypass for conversation continuity
- [ ] Idempotency Cache for duplicate request handling
- [ ] Replay Buffer with size limits

### Quality
- [ ] Structured Output Validator for schema enforcement
- [ ] LLM-as-Judge for critical quality decisions
- [ ] Hallucination Detector for fact verification

### Security
- [ ] Prompt-Injection Sanitizer for input validation
- [ ] PII Redactor for sensitive data protection
- [ ] Tool Permission Gateway for access control
- [ ] Audit Trail for compliance

### Performance
- [ ] Token Budget Enforcer for cost control
- [ ] Cache-Aside for response caching
- [ ] Graceful Degradation for overload handling

### Observability
- [ ] Distributed Tracing for request correlation
- [ ] Structured Logging for machine analysis
- [ ] Health Check for component monitoring
- [ ] Metrics Aggregation for statistical summary
- [ ] Anomaly Detection for unusual behavior

---

## References

- **ARCHITECTURE.md** — Pattern taxonomy and meta-architecture
- **DEV_PLAN.md** — Development checklist for the pattern catalog
- **README.md** — Quick start and pattern catalog overview
- **skills/** — Individual pattern skill definitions
- **agent-mesh** — Multi-agent orchestration implementation
- **mcp-contract-kit** — MCP protocol conformance testing
- **llm-router** — Cost-aware LLM routing
- **classifier-evals** — Intent classification evaluation
