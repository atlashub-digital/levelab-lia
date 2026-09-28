# LeveLab LIA

Conversational orchestration, policies, safety and program flows for **LIA — LeveLab Intelligent Assistant**.

## Scope

This repository owns:

- LIA system architecture
- system prompts and reusable policies
- persona/tone configuration
- memory policy
- tool contracts
- safety and escalation logic
- Corpo Forte 40+ conversational flows
- GLP-1 Companion guardrails
- check-ins, quizzes and reflection flows
- multimodal interaction rules
- Atendimento.Center / Chatwoot adapters
- human handoff context
- conversational QA and red-team tests

## Important boundary

LIA is an AI wellness companion. It does not diagnose, prescribe, adjust medication doses, make clinical decisions, or replace qualified professionals.

## Content architecture

LIA **must not maintain a duplicate editorial library**.

```text
Notion Content Lab
  -> Approved content
  -> LeveLab Backend runtime API
  -> LIA retrieves the relevant version
  -> LIA applies conversational flow + safety policy
```

## Corpo Forte experience

For each week, LIA can support:

- explain
- simplify
- ask one question at a time
- reflection
- quiz feedback
- goal setting
- weekly check-in
- commitment
- memory candidates
- recommendation of internal content
- professional/human escalation

## Safety defaults

- `clinical_interpretation = false`
- `medication_advice = false`
- `dose_adjustment = false`
- `diagnosis = false`
- `individualized_therapeutic_diet = false`
- escalation rules required for health-related flows

## Memory

Store only what is necessary and consented for product continuity. Avoid unnecessary clinical data in the conversation layer.

## Initial implementation tracks

1. core prompt/policy framework
2. content retrieval contract
3. Corpo Forte onboarding flow
4. weekly program flow engine
5. GLP-1 Companion safety layer
6. human handoff
7. multimodal inputs
8. evaluation + red-team suite

## Assets

Approved LIA visual masters remain in the LeveLab Google Drive DAM. Runtime copies should be optimized and referenced by asset IDs.

## Security

This repository is public. Do not commit secrets, private member data, hidden production prompts containing credentials, private keys, or provider tokens.
