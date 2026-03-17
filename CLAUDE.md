# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arkaic is a mobile Bitcoin wallet implementing the Ark protocol. Built with React Native + Expo (SDK 54), TypeScript, and the `@arkade-os/sdk` v0.3.0 by arkadeos. Supports iOS, Android, and web. Includes a P2P marketplace (listings, chat, escrow). **Not production-ready — no data encryption.**

## Quick Reference

| Topic | File |
|-------|------|
| Architecture, routing, state, Ark SDK | [.claude/docs/architecture.md](.claude/docs/architecture.md) |
| Code conventions, patterns, types | [.claude/docs/conventions.md](.claude/docs/conventions.md) |
| Commands, stack, commit convention | [.claude/docs/environment.md](.claude/docs/environment.md) |
| SDK APIs, Gluestack, React Query keys | [.claude/docs/packages.md](.claude/docs/packages.md) |

## Essential Rules

- **Package manager**: always `yarn`, never `npm`
- **Language**: all code, comments and content in **English**
- **Path alias**: `@/*` maps to project root — always use `@/` for imports
- **No test suite** exists
- **Commits**: Conventional Commits (`feat(wallet): ...`), never add AI attribution
- **No data encryption** — do not store private keys in AsyncStorage, use `expo-secure-store`

## Commit Convention

```
<type>(<scope>): <description>
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`.

Suggested scopes: `wallet`, `escrow`, `listings`, `chat`, `account`, `ui`, `store`, `hooks`, `deps`.

Split into atomic commits. Never add `Co-Authored-By: Claude` or any AI attribution.

## Versioning

```bash
yarn release:major    # 0.1.0 → 1.0.0
yarn release:minor    # 0.1.0 → 0.2.0
yarn release:patch    # 0.1.0 → 0.1.1
yarn changelog        # Generate changelog only
```

Uses `generate-changelog` to auto-generate `CHANGELOG.md` from commit messages.

## Agent Pipeline

Agents are defined in `.claude/agents/`. All agents must read this file first.

| Agent | Role | Task files |
|-------|------|-----------|
| **planner** | Plans tasks, writes developer prompts | `.claude/tasks/developer/` |
| **developer** | Implements code from task files | reads `.claude/tasks/developer/` |
| **reviewer** | Code review, updates CLAUDE.md | `.claude/tasks/reviewer/` |
| **versioner** | Atomic commits, pipeline cleanup | — |
| **maintainer** | Backend API documentation, updates `docs/` and `README.md` | — (standalone) |

Pipeline order: `planner → developer → reviewer → versioner`

The **maintainer** is standalone — invoke it independently when backend API endpoints change or new flows are added. It reads `hooks/**/*.ts` and `types/backend.ts` to extract endpoint contracts and produces docs in `docs/`.

Each agent can access any `.claude/docs/` file when needed. The audience annotation in each doc is a suggestion, not a restriction.
