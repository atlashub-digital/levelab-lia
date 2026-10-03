# Group Social Memory

Status: Accepted
Date: 2026-09-29

## Principle

A WhatsApp/community group should not make LIA amnesic.

It should make LIA **privacy-scoped**.

LIA may build social continuity from what a person publicly says and does in one specific group, while remaining technically separated from private-member memory.

## Four memory scopes

### 1. session

Short-lived conversational context.

### 2. private_member

Private one-to-one context.

Examples:
- preferred private name;
- private conversation continuity;
- explicitly consented preferences.

Never available to group mode.

### 3. program

Structured LeveLab program context.

Examples:
- current Corpo Forte week;
- target capability;
- minimum viable action;
- weekly commitment.

Private by default.

Never injected into a group unless that exact information was publicly shared in the group and captured independently as group-safe context.

### 4. group_social

Scoped to exactly one group.

Allowed:
- public display name;
- nickname used publicly in that group;
- member/moderator/admin role;
- conversational familiarity: new / known / regular;
- interaction style: direct / conversational / playful / reserved;
- preferred answer length observed in the group;
- public recent topics;
- short summary of public group interactions;
- last public interaction;
- interaction count;
- current public program theme of the group.

## Important semantic rule

"Familiarity" is conversational familiarity, **not intimacy profiling**.

LIA must not infer:
- mental state;
- diagnosis;
- medication use;
- private relationships;
- sexuality;
- political or religious beliefs;
- hidden emotional vulnerability;
- financial condition;
- other sensitive traits.

## Example

Allowed:

> "Cris costuma participar bastante e prefere ser chamada de Cris neste grupo. Na última conversa pública, perguntou sobre os sinais de progresso da Semana 1."

Not allowed:

> "Cris contou no privado que está usando uma medicação e está insegura com o próprio corpo."

Even if LIA knows the second statement privately, it does not exist in the group context.

## Group-local identity

The same member may have different group-social contexts:

```text
Member 123
├── Corpo Forte — Turma A
│   ├── name: Cris
│   ├── familiarity: regular
│   └── tone: playful
│
└── LeveLab+ Sono
    ├── name: Cristina
    ├── familiarity: new
    └── tone: reserved
```

Do not automatically merge these profiles.

## Retention

Recommended default:
- retain while the member participates in the group;
- compact old message history into a safe summary;
- expire detailed recent-topic memory;
- preserve only low-risk social continuity when still useful;
- provide deletion/forget controls.

## Runtime contract

Group calls should include:

```json
{
  "channel": "group",
  "groupId": "wa_group_123",
  "memberId": "member_456"
}
```

LIA Core queries only:

```text
GET /api/v1/lia/groups/:groupId/social-context/members/:memberId
```

It does not call the private member-context endpoint in group mode.

## Goal

LIA should feel like a real, respectful community presence:

> "Oi, Cris! Você voltou à nossa conversa sobre progresso 🙂"

without ever crossing the boundary into:

> "Como está aquela questão pessoal que você me contou no privado?"
