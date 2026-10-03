# LeveLab LIA

Conversational intelligence, memory policy, safety and program-aware experiences for **LIA — LeveLab Intelligent Assistant**.

## Product vision

LIA is not only the AI inside a course.

She is the LeveLab day-to-day companion across:

- web/app;
- WhatsApp;
- LeveLab communities;
- premium programs;
- Corpo Forte;
- future LeveLab Care experiences.

A member enrolled in **Corpo Forte** receives additional program-aware context, weekly content, optional daily micro-check-ins and personalized continuity.

## Architecture decision

**LIA is a separate product/service, but it reuses Atendimento.Center as the shared omnichannel control plane.**

We do **not** duplicate Chatwoot, Evolution, n8n and Typebot for every LeveLab agent/product.

See:

- [Architecture](docs/ARCHITECTURE.md)
- [Integrations](docs/INTEGRATIONS.md)
- [Corpo Forte Runtime](docs/CORPO_FORTE_RUNTIME.md)
- [Memory & Safety](docs/MEMORY_AND_SAFETY.md)
- [Deployment](docs/DEPLOYMENT.md)

## LIA owns

- persona and tone;
- system policies;
- safety;
- program-aware conversational flows;
- memory candidates and consent rules;
- weekly/daily check-ins;
- content retrieval behavior;
- group/community behavior;
- human escalation decisions;
- multimodal behavior;
- evaluation/red-team.

## LIA does not own

- canonical editorial content;
- member enrollment/progress database;
- WhatsApp transport;
- human inbox;
- deterministic lead funnels.

## Content architecture

```text
Notion Content Lab
  -> professional review
  -> approved version
  -> LeveLab Backend runtime API
  -> LIA retrieves relevant content
  -> LIA applies persona + member context + safety
```

LIA must not maintain a duplicate editorial library.

## Omnichannel architecture

```text
LIA Core
  <-> LeveLab Backend
  <-> Atendimento.Center
       -> Evolution / WhatsApp
       -> Chatwoot / human handoff
       -> n8n / async automation
       -> Typebot / deterministic flows
```

## Corpo Forte

The program experience is:

```text
microaula
  -> reading
  -> workbook
  -> LIA
  -> quiz
  -> commitment
  -> 7-day plan
  -> check-in
```

LIA can know, with consent:

- current week;
- chosen goal;
- capability target;
- main barrier;
- minimum viable action;
- selected progress signals;
- weekly commitment.

## Safety boundary

LIA is a wellness companion and educator.

It does not:

- diagnose;
- prescribe;
- alter medication;
- adjust dose;
- provide individualized therapeutic diets;
- interpret symptoms as a diagnosis;
- replace qualified professionals.

## WhatsApp groups

LIA may act as a **community assistant/moderator** through the channel layer.

Private member memory must never be exposed in a group conversation.

## Deployment

Phase 1: independent LIA service using the existing Atendimento.Center channel infrastructure.

Phase 2: move LIA compute to a dedicated VPS/cluster when scaling, isolation or processing load justifies it.

**Separate product, shared channel infrastructure.**

## Assets

Approved LIA visual masters remain in the LeveLab Google Drive DAM. Runtime copies must preserve the canonical LIA identity.

## Security

This repository is public.

Never commit:

- secrets;
- tokens;
- private member data;
- production credentials;
- unrestricted raw conversation exports;
- sensitive health records.
