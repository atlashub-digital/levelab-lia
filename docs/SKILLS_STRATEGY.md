# Skills Strategy

Status: Accepted
Date: 2026-09-28

## Why skills

LIA should support reusable capability packs without embedding every behavior into one giant system prompt.

We adopt the open Agent Skills pattern:

```text
skills/<skill-name>/
  SKILL.md
  references/
  examples/
  scripts/        # optional, restricted
```

Skills are **versioned behavior/knowledge modules**, not the source of truth for member state, safety, or clinical content.

## First-party LIA skills

Initial candidates:

- `corpo-forte-companion`
- `health-literacy`
- `weekly-checkin`
- `plan-b-return`
- `group-community-moderation`
- `human-handoff`
- `consultation-prep`
- `content-explainer`
- `quiz-feedback`

## Third-party/open-source skills policy

We may reuse open-source skills, but never by blindly cloning a large community repository into production.

For every external skill:

1. identify exact repository/path;
2. verify license;
3. pin commit/version;
4. review SKILL.md and every executable script;
5. classify permissions and side effects;
6. remove unnecessary tools/network access;
7. adapt it to LIA contracts;
8. add evals;
9. vendor only the reviewed files;
10. record attribution and source.

## Security

External skills must not:

- receive unrestricted production secrets;
- bypass LIA safety policy;
- write member memory directly;
- access private health context unless explicitly allowed by the skill contract;
- execute arbitrary shell/network actions by default;
- send messages directly to channels outside the approved tool layer.

The LIA orchestrator remains the policy enforcement point.

## Mem0

Mem0 is a strong candidate for an **optional semantic-memory adapter**, because it supports open-source/self-hosted memory and a TypeScript SDK.

Use only behind our own interface:

```ts
interface MemoryProvider {
  search(input: MemorySearch): Promise<MemoryItem[]>
  propose(input: MemoryCandidate): Promise<MemoryProposal>
  forget(input: MemorySelector): Promise<void>
}
```

Do not make application logic depend directly on Mem0-specific data structures.

## Letta / LangGraph

Useful as reference implementations for:

- long-running stateful agents;
- memory architecture;
- durable workflows;
- human-in-the-loop;
- skill loading.

Not selected as mandatory LIA runtime in Phase 1.

Reason: LIA already has explicit product state in LeveLab Backend and channel orchestration in Atendimento.Center. Introducing an additional full agent platform now would increase complexity before we have evidence that it is needed.

## Rule

**Borrow capabilities, not architecture debt.**

Open-source skills/frameworks are accelerators. LeveLab product state, safety, privacy and identity remain ours.
