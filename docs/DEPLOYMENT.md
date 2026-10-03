# Deployment Plan

## Recommended Phase 1

Do **not** provision a second full omnichannel VPS for LIA now.

Deploy LIA independently while reusing Atendimento.Center channel services.

### Components

```text
Internet
  |
  +--> levelab.org / app.levelab.org
  |        |
  |        +--> LeveLab Backend
  |        +--> LIA Core
  |
  +--> WhatsApp
           |
           +--> Evolution / Atendimento.Center
                    |
                    +--> LIA Core
                    +--> Chatwoot human handoff
```

## LIA Core

Recommended initial runtime:

- Node.js / TypeScript;
- NestJS or Fastify;
- provider abstraction for LLMs;
- Redis queue/cache;
- Postgres/Supabase;
- structured observability;
- versioned prompt/policy bundles;
- content retrieval from LeveLab Backend;
- explicit tool allow-list.

## Infrastructure isolation

Even on shared compute:

- separate Docker Compose project;
- separate environment file;
- separate secrets;
- separate database role;
- separate network where possible;
- rate limits;
- per-tenant/channel auth;
- separate log stream;
- health/readiness endpoints.

## Suggested domains

- `lia.doctor` — public LIA experience/brand;
- `api.lia.doctor` — LIA API if a standalone endpoint is useful;
- internal service address preferred for backend-to-backend calls;
- Atendimento.Center remains the channel control plane.

## n8n

Can remain on the Atendimento.Center VPS.

Use event-driven webhooks from LIA rather than embedding business-critical workflow state only in n8n.

## Typebot

Can remain centralized.

Use for deterministic flows such as:

- Check-up Corpo Forte;
- onboarding;
- lead qualification;
- campaign-specific forms.

## Chatwoot

Keep centralized as operator/human inbox.

Do not make LIA deployment depend on Chatwoot availability for normal web/app conversations.

## Scale-out path

When needed:

```text
Atendimento VPS
  Chatwoot / Evolution / n8n / Typebot
         |
         | secure API/webhook
         v
Dedicated LIA VPS / cluster
  lia-api
  lia-worker
  redis
  observability
         |
         v
LeveLab Backend / Supabase
```

This topology lets LIA move to dedicated compute without changing the product or channel contracts.
