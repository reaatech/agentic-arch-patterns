# Contributing to Agentic Architecture Patterns

Thank you for your interest in contributing to this patterns repository! This document provides guidelines and instructions for contributing.

## What We're Looking For

### New Patterns

We welcome new patterns that:

1. **Solve a recurring problem** in agentic system design
2. **Have been proven in production** — not theoretical
3. **Include runnable code** — TypeScript implementations that work
4. **Follow the established structure** — see below

### Pattern Improvements

Improvements to existing patterns are welcome:

- Bug fixes in code examples
- Additional failure modes
- Better cross-references
- Clarification of concepts
- Additional references

## Pattern Structure

Each pattern must follow this structure:

```markdown
# Pattern Name

## Abstract
One-paragraph summary (2-3 sentences).

## Problem Statement
What problem does this pattern solve? (1-2 paragraphs)

## Context
When does this pattern arise? (bullet points)

## Forces
Conflicting concerns that the pattern addresses. (bullet points with trade-offs)

## Solution
### Architecture Diagram
Mermaid diagram showing the pattern flow.

### Components
Key components and their responsibilities.

### Formal Properties
- **Invariants:** Conditions that must always be true
- **Guarantees:** What the pattern promises
- **Bounds:** Quantitative limits

## Implementation
Runnable TypeScript code example with:
- Interface definitions
- Class implementation
- Usage example

## Failure Modes
| Failure | Detection | Recovery |
|---------|-----------|----------|
| ... | ... | ... |

## When NOT to Use
Situations where this pattern is not appropriate.

## Cross-References
### Related Patterns
- **Pattern Name** (Part X) — Relationship description

### External Implementations
- **repo-name** — `path/to/implementation`

## References
- **Book/Article Title** — Author (relevance)
- **Documentation** — URL
```

## Contribution Process

### 1. Create an Issue First

Before writing a new pattern, create an issue to discuss:

- The problem the pattern solves
- Whether it's a true pattern (recurring, proven)
- How it fits in the existing taxonomy

### 2. Fork and Branch

```bash
# Fork the repository
git clone https://github.com/reaatech/agentic-arch-patterns.git
cd agentic-arch-patterns

# Create a branch
git checkout -b pattern/my-new-pattern
```

### 3. Create the Pattern File

```bash
# Create the skills directory
mkdir -p skills/my-pattern-name

# Create the skill.md file
touch skills/my-pattern-name/skill.md
```

### 4. Write the Pattern

Follow the structure outlined above. Key requirements:

- **Runnable code** — All TypeScript code must compile and run
- **Architecture diagram** — Mermaid diagram is required
- **Cross-references** — Link to related patterns
- **References** — Cite sources and inspiration

### 5. Test Your Code

Ensure all code examples work:

```bash
# Create a test file
cat > skills/my-pattern-name/example.ts << 'EOF'
// Your code example here
EOF

# Verify it compiles
npx tsc --noEmit skills/my-pattern-name/example.ts
```

### 6. Submit a Pull Request

1. Commit your changes with a descriptive message
2. Push to your fork
3. Create a pull request
4. Reference the original issue

### Pull Request Template

```markdown
## Pattern Name
[Brief name for the pattern]

## Problem Solved
[One sentence describing the problem]

## Production Proof
[Where has this pattern been used in production?]

## Related Patterns
[Links to related patterns in this repo]

## Checklist
- [ ] Pattern follows the established structure
- [ ] Code examples are runnable and tested
- [ ] Architecture diagram is included
- [ ] Cross-references to related patterns
- [ ] References are cited
```

## Code Quality Requirements

### TypeScript

- Use strict mode (`"strict": true`)
- Define interfaces for all data structures
- Include JSDoc comments for public APIs
- No `any` types — use proper typing

### Mermaid Diagrams

- Use `graph TB` for top-to-bottom flow
- Label all nodes clearly
- Use subgraphs for component grouping
- Test diagrams at [Mermaid Live Editor](https://mermaid.live)

### Markdown

- Use consistent heading hierarchy
- Format code blocks with language identifiers
- Use tables for structured data
- Keep lines under 100 characters

## Review Process

1. **Automated checks** — Markdown linting, link validation
2. **Technical review** — Code correctness, pattern validity
3. **Editorial review** — Clarity, consistency, completeness
4. **Final approval** — Merge by maintainer

## License

By contributing, you agree that your contributions will be licensed under the MIT License (same as the repository).

## Questions?

If you have questions about contributing, please:

1. Check existing issues for similar questions
2. Create a new issue with the `question` label
3. Join the discussion in existing issues

Thank you for contributing to making this a valuable resource for the community!
