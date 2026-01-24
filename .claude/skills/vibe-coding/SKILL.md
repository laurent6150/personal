# Vibe Coding: AI-Paired Development Methodology

---
name: vibe-coding
version: 1.0.0
description: Structured workflow for AI-assisted programming emphasizing planning, context management, and modular development
triggers:
  - vibe coding
  - project planning
  - implementation plan
  - context documentation
  - modular development
source: https://github.com/2025Emma/vibe-coding-cn
---

## Overview

Vibe Coding is a structured methodology for AI-assisted programming that treats AI as a pair programmer within carefully designed constraints. The core principle is: **"Planning is everything."**

## Core Principles

### 1. Context as Foundation
Establish clear project documentation before code generation:
- Project overview (name, background, objectives, vision)
- Scope definition (boundaries and constraints)
- Key entities & relationships
- Functional decomposition
- Technical direction (stack choices)
- Current status tracking
- Next steps & risks

### 2. Modular-First Approach
Explicitly prevent monolithic file structures:
- `/src` — Core source code
- `/tests` — Test code (unit, integration, E2E)
- `/docs` — Documentation
- `/scripts` — Script tools
- `/configs` — Configuration files
- `/data` — Data resources
- `/notebooks` — Jupyter experiments

### 3. Recursive Optimization
Use generator and optimizer prompts that improve iteratively.

## Implementation Workflow

```
Game Design Document → Tech Stack → Implementation Plan → Memory Bank → Iterative Development
```

### Phase 1: Project Context Documentation

Generate structured context files with 8 primary modules:
1. Project Overview
2. Scope Definition
3. Key Entities & Relationships
4. Functional Decomposition
5. Technical Direction
6. Interaction Conventions
7. Current Status
8. Next Steps & Risks

**Key Principle**: If information is not explicitly present or reasonably inferable, mark fields as 'pending information'—do not fabricate facts.

### Phase 2: Planning Documents

Generate hierarchical planning documents:

| Level | Content | Visualization |
|-------|---------|---------------|
| Level 1 | Overall project plan | System logic diagrams, module matrices, timelines |
| Level 2 | Module-level plans | Process flows, interface diagrams, resource tables |
| Level 3 | Specific task plans | Task execution diagrams, risk monitoring tables |

Files follow naming convention `plan_XX_[name].md` with continuous numbering.

### Phase 3: Iterative Development

- Implement with validation at each step
- Maintain Memory Bank (project context)
- Use progressive enhancement pattern

## Quick Reference

### Standard Directory Structure

```
project/
├── src/           # Core source code
├── tests/         # Test code
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/          # Documentation
├── scripts/       # Utility scripts
├── configs/       # Configuration files
├── data/          # Data resources
└── output/        # Generated outputs (timestamped)
```

### AI-Generated File Conventions

| Type | Location | Naming |
|------|----------|--------|
| Python source | `/src` | lowercase_underscore |
| Test code | `/tests` | `test_module_name.py` |
| Documentation | `/docs` | `module_description.md` |
| Temporary output | `/output` | Auto-timestamped |

### Planning Document Workflow

1. **Requirement Collection** → Gather user needs
2. **Deep Analysis** → Break down into components
3. **Plan Generation** → Create structured documents
4. **Review** → Validate completeness

## Boundaries (Not For)

This skill is NOT for:
- Writing actual implementation code during planning phase
- Using concrete file/function names in abstract plans
- Creating files outside the defined directory structure
- Fabricating information not provided by the user

## Examples

### Example 1: Starting a New Project

**Input**: "I want to build a task management app"

**Steps**:
1. Generate Project Context Document with 8 modules
2. Create Level 1 plan (`plan_01_overview.md`)
3. Break down into Level 2 module plans
4. Define specific tasks in Level 3 plans
5. Begin implementation with Memory Bank

### Example 2: Restructuring Existing Project

**Input**: "My project files are scattered everywhere"

**Steps**:
1. Analyze existing file types
2. Map current → standard structure
3. Execute migration with path updates
4. Validate with tests
5. Generate `structure_diff.json` and `refactor_report.md`

### Example 3: Adding New Feature

**Input**: "Add user authentication to my app"

**Steps**:
1. Update Project Context Document
2. Create feature-specific Level 2 plan
3. Define task breakdown in Level 3
4. Implement with validation at each step
5. Update Memory Bank with new context

## References

- Source Repository: https://github.com/2025Emma/vibe-coding-cn
- Community: https://t.me/glue_coding
- Recommended Models: Claude Opus 4.5, Claude Sonnet 4.5

## Related Skills

- `claude-skills` — Meta-skill for generating domain-specific skills
- `claude-code-guide` — Claude Code usage guidance
