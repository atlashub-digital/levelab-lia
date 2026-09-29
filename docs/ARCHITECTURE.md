# LIA Runtime Architecture

```text
WebChat / WhatsApp
        |
        v
Atendimento.Center
  Channel Gateway
        |
        v
Conversation Core
        |
        v
AI Orchestrator -> LIA policies from this repository
        |
        v
Tool Gateway
        |
        v
LeveLab Backend
        |
        v
LeveLab PostgreSQL
```

## Guest mode

Public test on levelab.org/lia and lia.doctor:
- short/session memory;
- limited tools;
- no private member state;
- assessment/account/WhatsApp CTAs.

## Member mode

Authenticated/verified member:
- structured personalization;
- active program;
- check-ins;
- entitlements;
- multimodal preferences;
- human handoff.

## Media

Atendimento.Center owns media transport and conversation attachment handling. LeveLab stores only business/journey media explicitly promoted through a scoped tool.
