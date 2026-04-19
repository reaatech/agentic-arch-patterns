# ARCHITECTURE.md — agentic-arch-patterns

## System Overview

This document describes the meta-architecture of the agentic-arch-patterns pattern catalog — the taxonomy, organization principles, and cross-cutting concerns that unify the 44 patterns documented in this repository.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Pattern Catalog                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Pattern Taxonomy                             │   │
│  │                                                                   │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │   │
│  │  │Orchestration│    │ Reliability │    │    State    │           │   │
│  │  │  Patterns   │    │  Patterns   │    │  Patterns   │           │   │
│  │  │  (5 ch.)    │    │  (5 ch.)    │    │  (5 ch.)    │           │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘           │   │
│  │                                                                   │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │   │
│  │  │   Quality   │    │  Security   │    │ Performance │           │   │
│  │  │  Patterns   │    │  Patterns   │    │  Patterns   │           │   │
│  │  │  (5 ch.)    │    │  (5 ch.)    │    │  (5 ch.)    │           │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘           │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐  │   │
│  │  │                    Observability Patterns (5 ch.)            │  │   │
│  │  └─────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Cross-Cutting Concerns                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pattern   │  │    Cross    │  │   Example   │  │  Terminology│    │
│  │  Template   │  │ References  │  │  Standards  │  │   Glossary  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       External References                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  agent-mesh │  │mcp-contract │  │  llm-router │  │classifier-  │    │
│  │             │  │    -kit     │  │             │  │  -evals     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Pattern Taxonomy

The 44 patterns (35 core + 9 sub-patterns) are organized into seven categories, each addressing a distinct aspect of agentic system architecture:

### Part I: Orchestration Patterns (5 patterns)

Orchestration patterns address the coordination of multiple agents working toward a common goal.

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Orchestrator-Worker** | How to coordinate task distribution among specialized agents? | Central coordinator dispatches work to workers |
| **Supervisor** | How to provide hierarchical oversight with escalation? | Manager agent supervises worker agents |
| **Pipeline** | How to chain sequential transformations? | Linear processing with output → input flow |
| **Fan-Out/Fan-In** | How to parallelize and aggregate results? | Parallel execution with result collection |
| **Router** | How to direct requests to appropriate agents? | Content-based routing to specialized handlers |

### Part II: Reliability Patterns (5 patterns)

Reliability patterns ensure system resilience in the face of failures.

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Circuit Breaker** | How to prevent cascading failures? | Fail fast when component is unhealthy |
| **Retry with Backoff** | How to handle transient failures? | Exponential backoff with jitter |
| **Fallback Chain** | How to degrade gracefully? | Ordered list of alternatives |
| **Bulkhead** | How to isolate resource failures? | Partition resources to contain failures |
| **Timeout** | How to bound waiting time? | Maximum wait with cancellation |

### Part III: State Management Patterns (5 patterns)

State management patterns handle persistence and context in multi-turn interactions.

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Session Bypass** | How to maintain conversational continuity? | Skip routing for active sessions |
| **Idempotency Cache** | How to handle duplicate requests? | Deduplicate by request identity |
| **Replay Buffer** | How to preserve conversation context? | Store and replay turn history |
| **Checkpoint** | How to enable recovery? | Periodic state persistence |
| **Saga** | How to coordinate distributed transactions? | Compensating transactions for rollback |

### Part IV: Quality Patterns (5 patterns)

Quality patterns ensure output correctness and appropriateness.

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Confidence Gate** | How to route based on certainty? | Threshold-based routing decisions |
| **Consensus Voting** | How to improve decision quality? | Multiple judges with voting |
| **LLM-as-Judge** | How to automate quality evaluation? | LLM evaluates LLM outputs |
| **Structured Output Validator** | How to enforce output schemas? | Schema validation on responses |
| **Hallucination Detector** | How to verify factual accuracy? | Cross-reference with trusted sources |

### Part V: Security Patterns (5 patterns)

Security patterns protect against malicious inputs and unauthorized access.

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Prompt-Injection Sanitizer** | How to prevent prompt injection? | Input validation and sanitization |
| **PII Redactor** | How to protect sensitive data? | Automatic data masking |
| **Multi-Key Rotation** | How to manage cryptographic keys? | Key versioning and rotation |
| **Tool Permission Gateway** | How to control tool access? | Capability-based authorization |
| **Audit Trail** | How to ensure accountability? | Immutable operation logging |

### Part VI: Performance Patterns (5 patterns)

Performance patterns optimize resource utilization and response times.

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Token Budget Enforcer** | How to control API costs? | Token allocation and limits |
| **Speculative Execution** | How to reduce latency? | Parallel candidate generation |
| **Cache-Aside** | How to avoid redundant computation? | Response caching with invalidation |
| **Batch Coalescing** | How to improve throughput? | Request batching |
| **Graceful Degradation** | How to maintain service under load? | Quality reduction when overloaded |

### Part VII: Observability Patterns (5 patterns)

Observability patterns enable monitoring, debugging, and analysis.

| Pattern | Problem | Solution |
|---------|---------|----------|
| **Distributed Tracing** | How to track requests across agents? | End-to-end trace correlation |
| **Structured Logging** | How to enable machine analysis? | JSON-formatted log events |
| **Health Check** | How to monitor component status? | Liveness and readiness probes |
| **Metrics Aggregation** | How to summarize system behavior? | Statistical metric collection |
| **Anomaly Detection** | How to identify unusual behavior? | Automated deviation detection |

### Sub-Patterns (9 additional patterns)

In addition to the 35 core patterns above, 9 sub-patterns provide specialized variants:

| Category | Sub-Patterns |
|----------|-------------|
| **State** | Workflow State, Session Management |
| **Quality** | Clarification |
| **Security** | API Key Validator, Rate Limiter, Tool Use Validation |
| **Observability** | Human Handoff, Audit Logger, Observability |

---

## Pattern Relationships

### Composition Graph

Patterns can be composed to build complete systems:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Complete Agentic System                      │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  Router     │───▶│  Circuit    │───▶│  Session    │              │
│  │  Pattern    │    │  Breaker    │    │  Bypass     │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                       │
│         ▼                  ▼                  ▼                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │ Confidence  │    │  Retry with │───▶│  Fallback   │              │
│  │  Gate       │    │  Backoff    │    │  Chain      │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                       │
│         ▼                  ▼                  ▼                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │ Distributed │    │  Token      │    │  Structured │              │
│  │  Tracing    │    │  Budget     │    │  Output     │              │
│  │             │    │  Enforcer   │    │  Validator  │              │
│  └─────────────┘    └─────────────┘    └─────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### Pattern Dependencies

| Pattern | Depends On | Used By |
|---------|------------|---------|
| Circuit Breaker | Timeout | Fallback Chain |
| Retry with Backoff | Timeout | Circuit Breaker |
| Fallback Chain | Circuit Breaker | Router |
| Confidence Gate | Router | Supervisor |
| Session Bypass | Replay Buffer | Router |
| Idempotency Cache | Checkpoint | Retry with Backoff |
| Consensus Voting | LLM-as-Judge | Supervisor |
| Structured Output Validator | Retry with Backoff | Hallucination Detector |
| Token Budget Enforcer | Cache-Aside | Graceful Degradation |
| Distributed Tracing | Structured Logging | Anomaly Detection |

### Mutual Exclusivity

Some patterns are alternatives rather than complements:

| Pattern A | Pattern B | Selection Criteria |
|-----------|-----------|-------------------|
| Orchestrator-Worker | Pipeline | Task independence |
| Consensus Voting | LLM-as-Judge | Accuracy vs cost |
| Cache-Aside | Speculative Execution | Hit rate vs latency |
| Retry with Backoff | Fallback Chain | Failure type |

---

## Pattern Template

Every pattern chapter follows a standardized template to ensure consistency and completeness:

### Template Structure

```markdown
# Pattern Name

## Abstract
[One-paragraph summary]

## Problem Statement
[Formal problem definition]

## Context
[When this problem arises]

## Forces
[Competing concerns]

## Solution
### Architecture Diagram
[Mermaid diagram]

### Components
[Component descriptions]

### Interaction Sequence
[Step-by-step execution]

### Formal Properties
[Invariants, guarantees, bounds]

## Implementation
### TypeScript Example
[Complete runnable code]

### Key Design Decisions
[Design rationale]

## Failure Modes
[Failure analysis table]

## When NOT to Use
[Anti-pattern guidance]

## Cross-References
[Related patterns and repos]

## References
[Academic and industry references]
```

### Formal Properties Section

Each pattern documents its formal properties:

**Invariants:** Conditions that must always hold during pattern execution.

**Guarantees:** Promises the pattern makes about its behavior.

**Bounds:** Limits on resources, time, or scope.

Example for Circuit Breaker:
```
Invariants:
- State is always one of: CLOSED, OPEN, HALF_OPEN
- failure_count = 0 when state = CLOSED
- failure_count ≥ threshold when state = OPEN

Guarantees:
- Requests are rejected within O(1) when circuit is OPEN
- Recovery is attempted after reset_timeout
- State transitions are atomic

Bounds:
- Memory: O(1) per circuit breaker
- Recovery time: bounded by reset_timeout × backoff_multiplier
```

---

## Cross-Reference System

### Internal Cross-References

Patterns reference related patterns within this catalog:

```markdown
## Cross-References

### Related Patterns
- **Circuit Breaker** (Part II) — Often composed with this pattern
- **Retry with Backoff** (Part II) — Alternative approach
- **Fallback Chain** (Part II) — Extends this pattern

### Anti-Patterns
- **Retry Storm** — Unbounded retries without backoff
- **Cascading Failure** — Missing bulkhead isolation
```

### External Cross-References

Patterns reference implementations in related repositories:

| Pattern | Repository | File/Component |
|---------|------------|----------------|
| Router | agent-mesh | `src/classifier/`, `src/confidence/` |
| Circuit Breaker | agent-mesh | `src/utils/circuitBreaker.ts` |
| Session Bypass | agent-mesh | `src/session/session.middleware.ts` |
| Confidence Gate | agent-mesh | `src/confidence/confidence.gate.ts` |
| Structured Output Validator | mcp-contract-kit | `src/validators/protocol/` |
| LLM-as-Judge | classifier-evals | `src/judge/` |
| Token Budget Enforcer | llm-router | `src/telemetry/budget-manager.ts` |
| Fallback Chain | llm-router | `src/fallback/fallback-chain.ts` |
| Distributed Tracing | agent-mesh | `src/observability/otel.ts` |
| Structured Logging | agent-mesh | `src/observability/logger.ts` |

---

## Terminology Glossary

### Core Terms

**Agent:** An autonomous component that processes inputs and produces outputs using an LLM.

**Orchestrator:** A coordinating agent that dispatches work to other agents.

**Worker:** An agent that performs specific tasks assigned by an orchestrator.

**Session:** A sequence of related interactions with a user, maintaining state across turns.

**Turn:** A single request-response exchange within a session.

**Intent:** The classified purpose of a user's request.

**Entity:** Structured data extracted from user input.

**Confidence:** A numerical score (0.0–1.0) representing certainty in a classification or decision.

### Pattern-Specific Terms

**Circuit State:** The current state of a circuit breaker (CLOSED, OPEN, HALF_OPEN).

**Idempotency Key:** A unique identifier used to detect and deduplicate repeated requests.

**Compensating Transaction:** An operation that reverses the effects of a previous operation.

**Trace Context:** Propagation of request identifiers across service boundaries.

**Health Probe:** A check that determines if a component is functioning correctly.

---

## Decision Tree for Pattern Selection

```
Start: Building an agentic system
│
├─ Need to coordinate multiple agents?
│  ├─ Yes → Orchestrator-Worker
│  │   ├─ Need hierarchical oversight? → Supervisor
│  │   ├─ Sequential processing? → Pipeline
│  │   └─ Parallel execution? → Fan-Out/Fan-In
│  └─ No → Continue
│
├─ Need to handle failures?
│  ├─ Transient failures? → Retry with Backoff
│  ├─ Cascading failures? → Circuit Breaker
│  ├─ Need alternatives? → Fallback Chain
│  ├─ Resource isolation? → Bulkhead
│  └─ Bounded waiting? → Timeout
│
├─ Need to manage state?
│  ├─ Multi-turn conversation? → Session Bypass
│  ├─ Duplicate requests? → Idempotency Cache
│  ├─ Context preservation? → Replay Buffer
│  ├─ Recovery points? → Checkpoint
│  └─ Distributed transactions? → Saga
│
├─ Need quality assurance?
│  ├─ Threshold-based routing? → Confidence Gate
│  ├─ Multiple opinions? → Consensus Voting
│  ├─ Automated evaluation? → LLM-as-Judge
│  ├─ Schema enforcement? → Structured Output Validator
│  └─ Fact verification? → Hallucination Detector
│
├─ Need security?
│  ├─ Input validation? → Prompt-Injection Sanitizer
│  ├─ Data protection? → PII Redactor
│  ├─ Key management? → Multi-Key Rotation
│  ├─ Access control? → Tool Permission Gateway
│  └─ Compliance? → Audit Trail
│
├─ Need performance?
│  ├─ Cost control? → Token Budget Enforcer
│  ├─ Latency reduction? → Speculative Execution
│  ├─ Avoid recomputation? → Cache-Aside
│  ├─ Improve throughput? → Batch Coalescing
│  └─ Handle overload? → Graceful Degradation
│
└─ Need observability?
   ├─ Request tracking? → Distributed Tracing
   ├─ Log analysis? → Structured Logging
   ├─ Status monitoring? → Health Check
   ├─ Statistical summary? → Metrics Aggregation
   └─ Unusual behavior? → Anomaly Detection
```

---

## Anti-Pattern Catalog

### Orchestration Anti-Patterns

**God Agent:** A single agent that handles all tasks, violating separation of concerns.
- **Symptom:** One agent with hundreds of tools
- **Consequence:** Unmaintainable, slow, error-prone
- **Remedy:** Apply Orchestrator-Worker or Router pattern

**Chained Dependency:** Agents calling agents calling agents in deep chains.
- **Symptom:** Latency grows linearly with chain depth
- **Consequence:** Cascading failures, unbounded latency
- **Remedy:** Apply Fan-Out/Fan-In with bounded depth

### Reliability Anti-Patterns

**Retry Storm:** Unbounded retries without backoff or jitter.
- **Symptom:** Exponential traffic amplification during outages
- **Consequence:** Prolonged recovery, resource exhaustion
- **Remedy:** Apply Retry with Backoff pattern

**Zombie Circuit:** Circuit breaker that never recovers.
- **Symptom:** Circuit stays OPEN indefinitely
- **Consequence:** Permanent service unavailability
- **Remedy:** Implement HALF_OPEN state with recovery testing

### State Anti-Patterns

**Session Leakage:** User data visible across sessions.
- **Symptom:** One user sees another user's conversation
- **Consequence:** Privacy violation, data breach
- **Remedy:** Apply Session Bypass with proper isolation

**Infinite Replay:** Unbounded conversation history.
- **Symptom:** Context window grows without limit
- **Consequence:** Token cost explosion, latency increase
- **Remedy:** Apply Replay Buffer with size limits

### Quality Anti-Patterns

**Blind Trust:** Accepting LLM output without validation.
- **Symptom:** No output validation or verification
- **Consequence:** Hallucinations, schema violations
- **Remedy:** Apply Structured Output Validator and Hallucination Detector

**Single Point of Judgment:** One model makes all decisions.
- **Symptom:** No consensus or verification
- **Consequence:** Systematic biases, single model failures
- **Remedy:** Apply Consensus Voting or LLM-as-Judge

### Security Anti-Patterns

**Prompt Injection:** User input directly concatenated into prompts.
- **Symptom:** Raw user input in system prompts
- **Consequence:** Jailbreaking, data exfiltration
- **Remedy:** Apply Prompt-Injection Sanitizer

**Hardcoded Secrets:** API keys in source code.
- **Symptom:** Secrets in version control
- **Consequence:** Credential compromise
- **Remedy:** Apply Multi-Key Rotation with secret management

### Performance Anti-Patterns

**Token Profligacy:** Unnecessary token consumption.
- **Symptom:** No token counting or budgeting
- **Consequence:** Cost overruns, quota exhaustion
- **Remedy:** Apply Token Budget Enforcer

**Cache Stampede:** Many requests for the same uncached item.
- **Symptom:** Thundering herd on cache miss
- **Consequence:** Backend overload
- **Remedy:** Apply Cache-Aside with request coalescing

### Observability Anti-Patterns

**Debug Logging in Production:** Verbose logs that obscure signals.
- **Symptom:** Gigabytes of debug output
- **Consequence:** Can't find important events, high storage cost
- **Remedy:** Apply Structured Logging with appropriate levels

**Distributed Debugging:** No request correlation across services.
- **Symptom:** Can't trace a request through the system
- **Consequence:** Impossible to debug production issues
- **Remedy:** Apply Distributed Tracing

---

## Versioning and Evolution

### Pattern Versioning

Patterns are versioned independently:

```
pattern-name.md          # Current version
pattern-name-v1.0.md     # Archived version
```

Version changes are documented in the pattern's changelog section.

### Version Compatibility

| Change Type | Version Bump | Backward Compatible |
|-------------|--------------|---------------------|
| Typo fix | Patch | Yes |
| Example improvement | Patch | Yes |
| New failure mode | Minor | Yes |
| New component | Minor | Yes |
| Changed invariants | Major | No |
| Removed component | Major | No |

### Deprecation Policy

Deprecated patterns are marked with:

```markdown
> **Deprecated:** This pattern is deprecated as of v2.0. Use [New Pattern](link) instead.
```

Deprecated patterns remain in the catalog for 2 major versions before removal.

---

## References

### Academic Foundations

- **Pattern-Oriented Software Architecture** (Buschmann et al., 1996) — Pattern language foundations
- **Release It!** (Nygard, 2007) — Reliability patterns
- **Designing Data-Intensive Applications** (Kleppmann, 2017) — Distributed systems patterns
- **Building Microservices** (Newman, 2015) — Service architecture patterns

### Industry References

- **AWS Well-Architected Framework** — Cloud architecture best practices
- **Google SRE Book** — Reliability engineering practices
- **Microsoft Azure Architecture Center** — Cloud design patterns
- **Netflix Hystrix** — Circuit breaker implementation

### Related Repositories

- **agent-mesh** — Multi-agent orchestration implementation
- **mcp-contract-kit** — MCP protocol conformance testing
- **llm-router** — Cost-aware LLM routing
- **classifier-evals** — Intent classification evaluation

---

## Contributing New Patterns

### Pattern Submission Process

1. **Proposal:** Submit a pattern proposal with problem statement and forces
2. **Review:** Community review of problem validity and solution approach
3. **Implementation:** Write full pattern chapter following the template
4. **Example:** Provide complete TypeScript implementation
5. **Cross-Reference:** Link to related patterns and external implementations
6. **Approval:** Technical review and approval by maintainers

### Pattern Quality Criteria

- **Problem Validity:** The problem must be real and common
- **Solution Correctness:** The solution must actually solve the problem
- **Formal Rigor:** Invariants, guarantees, and bounds must be precise
- **Example Completeness:** Code must compile and run
- **Failure Analysis:** All failure modes must be documented
- **Anti-Pattern Guidance:** Clear guidance on when NOT to use

---

## References

- **AGENTS.md** — Guide for applying patterns to agent systems
- **DEV_PLAN.md** — Development checklist for the pattern catalog
- **README.md** — Quick start and pattern catalog overview
- **skills/** — Individual pattern skill definitions
