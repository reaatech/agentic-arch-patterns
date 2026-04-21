# Agentic Architecture Patterns

> A "Designing Data-Intensive Applications" for agentic systems. Not a library; a reference book as a repo.

This repository documents battle-tested patterns for building enterprise-grade AI agent systems. Each pattern covers the problem, forces, solution with architecture diagrams, runnable TypeScript implementation, failure modes, and when not to use it.

## Why This Exists

Building production AI agent systems requires more than just prompting an LLM. You need:

- **Coordination patterns** for multi-agent systems
- **Resilience patterns** for unreliable components  
- **Security patterns** for enterprise requirements
- **Observability patterns** for debugging complex flows

This repo captures the architectural knowledge from building systems like [agent-mesh](https://github.com/reaatech/agent-mesh), [llm-router](https://github.com/reaatech/llm-router), and [classifier-evals](https://github.com/reaatech/classifier-evals).

## Quick Navigation

| Part | Patterns | Description |
|------|----------|-------------|
| **Part I: Coordination** | Orchestrator-Worker, Supervisor, Pipeline, Fan-Out/Fan-In, Router | How agents coordinate work |
| **Part II: Reliability** | Circuit Breaker, Retry with Backoff, Fallback Chain, Bulkhead, Timeout | Handling failures gracefully |
| **Part III: State** | Session Bypass, Idempotency Cache, Replay Buffer, Checkpoint, Saga | Managing conversation state |
| **Part IV: Quality** | Confidence Gate, Consensus Voting, LLM-as-Judge, Structured Output Validator, Hallucination Detector | Ensuring output quality |
| **Part V: Security** | Prompt-Injection Sanitizer, PII Redactor, Multi-Key Rotation, Tool Permission Gateway, Audit Trail | Enterprise security patterns |
| **Part VI: Performance** | Token Budget Enforcer, Speculative Execution, Cache-Aside, Batch Coalescing, Graceful Degradation | Optimizing resource usage |
| **Part VII: Observability** | Distributed Tracing, Structured Logging, Health Check, Metrics Aggregation, Anomaly Detection | Monitoring and debugging |

## Pattern Structure

Each pattern follows a consistent structure:

```markdown
# Pattern Name

## Abstract
One-paragraph summary of the pattern.

## Problem Statement  
What problem does this pattern solve?

## Context
When does this pattern arise?

## Forces
Conflicting concerns that the pattern addresses.

## Solution
### Architecture Diagram
Mermaid diagram showing the pattern flow.

### Components
Key components and their responsibilities.

### Formal Properties
Invariants, guarantees, and bounds.

## Implementation
Runnable TypeScript code example.

## Failure Modes
How the pattern can fail and recovery strategies.

## When NOT to Use
Situations where this pattern is not appropriate.

## Cross-References
Related patterns and external implementations.

## References
Books, articles, and documentation.
```

## Patterns Overview

### Part I: Coordination Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| [Orchestrator-Worker](skills/orchestrator-worker/skill.md) | Central coordinator delegates to specialized workers | Multi-agent task distribution |
| [Supervisor](skills/supervisor/skill.md) | Supervisor evaluates and routes work dynamically | Complex decision-making workflows |
| [Pipeline](skills/pipeline/skill.md) | Sequential processing through specialized stages | Multi-stage data processing |
| [Fan-Out/Fan-In](skills/fan-out-fan-in/skill.md) | Parallel execution with result aggregation | Independent parallelizable tasks |
| [Router](skills/router/skill.md) | Intent-based routing to specialized agents | Multi-agent systems with specialization |

### Part II: Resilience Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| [Circuit Breaker](skills/circuit-breaker/skill.md) | Prevents cascading failures by failing fast | Unreliable external dependencies |
| [Retry with Backoff](skills/retry-backoff/skill.md) | Exponential backoff with jitter for retries | Transient failures |
| [Fallback Chain](skills/fallback-chain/skill.md) | Ordered degradation path when primary fails | Graceful degradation requirements |
| [Bulkhead](skills/bulkhead/skill.md) | Resource isolation to prevent cascading failures | Multi-tenant or mixed-workload systems |
| [Timeout](skills/timeout/skill.md) | Bounded waiting with timeout enforcement | External API calls |

### Part III: State Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| [Session Bypass](skills/session-bypass/skill.md) | Skip classification for active sessions | Multi-turn conversation consistency |
| [Idempotency Cache](skills/idempotency-cache/skill.md) | Deduplicate repeated requests | Retry safety, exactly-once semantics |
| [Replay Buffer](skills/replay-buffer/skill.md) | Sliding window of recent turns | Context window management |
| [Checkpoint](skills/checkpoint/skill.md) | Periodic state persistence for recovery | Long-running workflow recovery |
| [Saga](skills/saga/skill.md) | Distributed transaction coordination | Multi-step workflows with compensation |
| [Workflow State](skills/workflow-state/skill.md) | Agent-managed state persistence | Multi-turn agent context |
| [Session Management](skills/session-management/skill.md) | Persistent session storage with TTL | Multi-turn conversation storage |

### Part IV: Quality Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| [Confidence Gate](skills/confidence-gate/skill.md) | Threshold-based routing decisions | Quality-controlled routing |
| [Consensus Voting](skills/consensus-voting/skill.md) | Multi-judge agreement for decisions | Critical decision-making |
| [LLM-as-Judge](skills/llm-as-judge/skill.md) | Automated quality evaluation | Output quality assessment |
| [Structured Output Validator](skills/structured-output-validator/skill.md) | Schema enforcement on responses | API response validation |
| [Hallucination Detector](skills/hallucination-detector/skill.md) | Fact-checking with source verification | Factual accuracy requirements |

### Additional Quality Patterns (Sub-patterns)

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| [Clarification](skills/clarification/skill.md) | Generate questions to resolve ambiguity | Low-confidence classification |

### Part V: Security Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| [Prompt Injection Sanitizer](skills/prompt-injection-sanitizer/skill.md) | Detect and neutralize injection attempts | User-facing LLM inputs |
| [PII Redactor](skills/pii-redactor/skill.md) | Mask sensitive information before agent processing | Privacy and compliance requirements |
| [Tool Permission Gateway](skills/tool-permission-gateway/skill.md) | Enforce capability-based tool authorization | Controlled tool access |
| [Audit Trail](skills/audit-trail/skill.md) | Immutable security event logging | Compliance and forensics |
| [API Key Validator](skills/api-key-validator/skill.md) | Validate and cache API key authentication | API access control |
| [Multi-Key Rotation](skills/multi-key-rotation/skill.md) | Cryptographic key lifecycle management | Security compliance |
| [Rate Limiter](skills/rate-limiter/skill.md) | Token bucket rate limiting per client | API abuse prevention |
| [Tool Use Validation](skills/tool-use-validation/skill.md) | Validate LLM-generated tool calls | MCP tool execution |

### Part VI: Performance Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| [Token Budget Enforcer](skills/token-budget-enforcer/skill.md) | Cost-aware token allocation and limits | Controlling LLM API costs |
| [Speculative Execution](skills/speculative-execution/skill.md) | Parallel candidate generation | Latency-sensitive responses |
| [Cache-Aside](skills/cache-aside/skill.md) | Response caching with invalidation | Avoiding redundant API calls |
| [Batch Coalescing](skills/batch-coalescing/skill.md) | Request batching for throughput | High-volume request processing |
| [Graceful Degradation](skills/graceful-degradation/skill.md) | Quality reduction under load | Overload handling |

### Part VII: Observability Patterns

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| [Health Check](skills/health-check/skill.md) | Liveness, readiness, and deep health probes | Load balancer integration |
| [Structured Logging](skills/structured-logging/skill.md) | Contextual logging with correlation IDs | Debugging complex flows |
| [Distributed Tracing](skills/distributed-tracing/skill.md) | Request tracing across services | Debugging distributed systems |
| [Metrics Aggregation](skills/metrics-aggregation/skill.md) | Quantitative measurements and aggregation | Performance monitoring |
| [Anomaly Detection](skills/anomaly-detection/skill.md) | Automated deviation identification | Proactive alerting |
| [Human Handoff](skills/human-handoff/skill.md) | Transfer to human operator when needed | Edge case escalation |
| [Audit Logger](skills/audit-logger/skill.md) | Immutable event logging for compliance | Regulatory requirements |
| [Observability](skills/observability/skill.md) | Unified observability infrastructure | Production debugging |

## Related Repositories

This patterns repo complements other repos in the ecosystem:

| Repo | Description |
|------|-------------|
| [agent-mesh](../agent-mesh) | Multi-agent orchestrator implementation |
| [mcp-contract-kit](../mcp-contract-kit) | MCP conformance testing suite |
| [llm-router](../llm-router) | Cost-aware LLM model routing |
| [classifier-evals](../classifier-evals) | Offline evaluation harness |
| [mcp-server-starter-ts](../mcp-server-starter-ts) | MCP server template |

## Contributing

This is a living document. If you've discovered a new pattern or have improvements to existing patterns:

1. Fork the repository
2. Create a new branch for your changes
3. Follow the pattern structure outlined above
4. Include runnable TypeScript code
5. Add cross-references to related patterns
6. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

These patterns are distilled from building production AI systems at scale, including:

- **AskGM** — Enterprise employee assistance platform
- **agent-mesh** — Multi-agent orchestration framework
- **llm-router** — Cost-optimized LLM routing
- **classifier-evals** — Evaluation harness for intent classification

Special thanks to the teams who built these systems and contributed to the patterns documented here.

## References

- **Designing Data-Intensive Applications** — Martin Kleppmann (patterns inspiration)
- **Release It!** — Michael Nygard (resilience patterns)
- **Enterprise Integration Patterns** — Gregor Hohpe & Bobby Woolf
- **Google SRE Book** — Site Reliability Engineering practices
- **OpenTelemetry** — Observability standards
- **MCP Specification** — Model Context Protocol
