# Integration Responsibilities

## Evolution API

Role: WhatsApp transport and event source.

Use for:

- inbound/outbound WhatsApp messages;
- media events;
- delivery/read events;
- group events where supported by the configured provider/session;
- contact/group identifiers;
- webhook delivery to Atendimento.Center/LIA gateway.

Evolution must not own:

- LIA memory;
- program logic;
- safety decisions;
- content source-of-truth.

## Chatwoot

Role: human service desk and conversation handoff.

Use for:

- human takeover;
- agent assignment;
- labels;
- internal notes;
- operator visibility;
- support SLA;
- conversation history needed by human operators.

Do not use Chatwoot as the canonical store for:

- program progress;
- member profile;
- LIA long-term memory;
- health-related structured data.

Chatwoot's current official WhatsApp documentation is centered on WhatsApp Business conversations/inboxes. For LeveLab WhatsApp groups, prefer the Evolution/channel-event path and mirror only the interactions that actually need human support into Chatwoot.

## n8n

Role: asynchronous automation.

Good uses:

- scheduled weekly messages;
- reminder workflows;
- content publication jobs;
- notification fan-out;
- CRM/analytics sync;
- lead-routing;
- operational alerts;
- back-office integrations.

Avoid using n8n as:

- the real-time LIA reasoning engine;
- the primary conversation state store;
- the safety decision layer;
- the canonical program engine.

Critical LIA decisions must live in versioned code.

## Typebot

Role: deterministic/visual flows.

Good uses:

- Check-up Corpo Forte;
- lead magnets;
- onboarding wizard;
- structured intake;
- surveys;
- guided opt-in flows;
- campaign flows.

Do not make Typebot the primary free-form LIA runtime.

A Typebot flow may hand off into LIA after deterministic data capture.

## LeveLab Web/App

Role: structured learning experience.

Owns the UI for:

- program modules;
- microaulas;
- readings;
- Workbook exercises;
- quizzes;
- weekly plan;
- check-out;
- dashboard;
- account/consent controls.

## LIA ↔ Atendimento.Center contract

At minimum, events should support:

```ts
type ChannelInboundEvent = {
  eventId: string
  channel: "web" | "whatsapp" | "group" | "chatwoot"
  externalConversationId: string
  externalUserId?: string
  tenantId: string
  timestamp: string
  message: {
    type: "text" | "audio" | "image" | "document" | "event"
    text?: string
    mediaRef?: string
  }
}
```

LIA response:

```ts
type LiaResponse = {
  correlationId: string
  action: "reply" | "handoff" | "silent" | "moderate"
  messages?: Array<{
    type: "text" | "audio" | "image"
    content?: string
    mediaRef?: string
  }>
  handoff?: {
    queue: "support" | "nutrition" | "exercise" | "medical" | "behavior"
    reasonCode: string
    summary: string
  }
  memoryCandidates?: Array<{
    key: string
    value: unknown
    consentRequired: boolean
    ttl?: string
  }>
}
```

## Rule

Transport tools move messages.  
LIA decides how to converse.  
LeveLab Backend owns product state.  
Humans take over through Atendimento.Center.
