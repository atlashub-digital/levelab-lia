# LIA Architecture Decision

Status: Accepted  
Date: 2026-09-28  
Scope: LeveLab LIA, Corpo Forte, Atendimento.Center

## Decision

LIA is a **separate product/service** with its own repository, runtime, policies, memory contract and evaluation suite.

LIA does **not** duplicate the omnichannel infrastructure already owned by Atendimento.Center.

Recommended topology:

```text
Web/App levelab.org
        |
        v
   LeveLab Backend
        |
        +------> Program/Content/Enrollment/Progress
        |
        v
      LIA Core  <-------------------------------+
        |                                        |
        | tool / context                         | events / replies
        v                                        |
Atendimento.Center API / Channel Gateway         |
        |                                        |
   +----+---------+-----------+                  |
   |              |           |                  |
Chatwoot       Evolution     Typebot              |
   |              |           |                  |
Human          WhatsApp    deterministic          |
handoff        1:1/groups   flows                 |
                  |                                |
                  +--------------> user/community-+
        
n8n = asynchronous workflow automation only
```

## Boundary

### LIA owns

- conversational identity and persona;
- system policies;
- safety policy;
- program-aware conversation;
- content retrieval logic;
- memory candidates and consent rules;
- weekly check-ins;
- personalization;
- tool contracts;
- escalation decisions;
- group/community moderation policy;
- multimodal behavior;
- evaluations and red-team tests.

### LeveLab Backend owns

- members;
- consent records;
- enrollment;
- program state;
- modules;
- content versions;
- exercise responses;
- quiz results;
- commitments;
- trackers;
- subscription/entitlements;
- runtime-approved content;
- audit events.

### Atendimento.Center owns

- channel adapters;
- inbox routing;
- human handoff;
- operator console;
- Chatwoot integration;
- Evolution integration;
- outbound/inbound transport;
- automation hooks;
- multi-tenant channel operations.

## Why not duplicate Chatwoot/Evolution/n8n/Typebot?

A second full stack would duplicate:

- upgrades;
- backups;
- observability;
- Redis/Postgres maintenance;
- WhatsApp session management;
- webhooks;
- operator configuration;
- security patching;
- monitoring.

The LIA requires **logical and data isolation**, not necessarily a complete second copy of every infrastructure component.

## Deployment recommendation

### Phase 1 — recommended now

Reuse the Atendimento.Center infrastructure for channels, but deploy LIA as an **independent container/service**.

Suggested logical deployment:

```text
VPS Atendimento.Center
├── atendimento-api
├── chatwoot
├── evolution
├── n8n
├── typebot
├── redis/shared infra
└── lia-core       <-- separate container/network policy
```

LIA should use:

- LeveLab dedicated Supabase/PostgreSQL for product/program data;
- dedicated LIA schema or service-owned tables;
- separate secrets;
- separate service account;
- separate queue namespace or isolated Redis instance when needed;
- its own logs/metrics.

### Phase 2 — dedicated compute when justified

Move `lia-core` to a dedicated VPS/container platform when one or more are true:

- high conversation volume;
- material latency pressure;
- stricter isolation requirements;
- audio/image processing becomes heavy;
- independent scaling is needed;
- public commercial LIA becomes a product beyond LeveLab;
- multiple brands/personas depend on the same runtime.

The integration contract with Atendimento.Center remains unchanged, so this move does not require duplicating Chatwoot/Evolution.

## Key principle

**Separate product, shared channel infrastructure.**

LIA must be independently deployable, but channel infrastructure should remain centralized unless operational evidence justifies duplication.

## Runtime modes

### Guest mode

Public test on levelab.org/lia and lia.doctor:
- short/session memory;
- limited tools;
- no private member state;
- assessment/account/WhatsApp CTAs.

### Member mode

Authenticated/verified member:
- structured personalization;
- active program;
- check-ins;
- entitlements;
- multimodal preferences;
- human handoff.

## Media

Atendimento.Center owns media transport and conversation attachment handling. LeveLab stores only business/journey media explicitly promoted through a scoped tool.

## Update — 2026-10-03: dedicated LeveLab host

LeveLab (LIA Core + LeveLab Backend) moves to its own Docker host (`atlaslab`), isolated per project under `/opt/levelab`, behind a shared Caddy edge. Channel infrastructure (Chatwoot, Evolution, Typebot) stays on the Atendimento.Center host and is reached only through its API, per the principle above. The web frontend is deployed on Vercel.
