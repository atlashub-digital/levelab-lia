# Corpo Forte Runtime Model

## Positioning

Corpo Forte is not a PDF product with an AI add-on.

It is an 8-week learning product:

```text
Microaula
  -> Reading
  -> Workbook
  -> LIA
  -> Quiz
  -> Commitment
  -> 7-day plan
  -> Mid-week check-in
  -> Weekly check-out
```

## LIA entitlement

A member enrolled in Corpo Forte receives an additional LIA capability profile.

Example:

```json
{
  "entitlements": [
    "lia_companion",
    "corpo_forte_v1"
  ],
  "program_context": {
    "program": "corpo-forte",
    "week": 3,
    "module": "S03"
  }
}
```

## Program-aware memory

With consent, LIA may know:

- current week;
- chosen goal;
- capability target;
- main barrier;
- minimum viable action;
- selected progress signals;
- weekly commitment;
- preferred check-in style;
- completed modules;
- quiz concepts that need reinforcement.

LIA should not persist unnecessary clinical detail.

## Daily companion behavior

Corpo Forte does not require daily engagement.

LIA may offer optional micro-interactions:

### Monday
Week opening and primary action.

### Tuesday
Barrier check.

### Wednesday
One educational micro-note or myth.

### Thursday
"Does your plan still fit, or do we need Plan B?"

### Friday
Invisible-win prompt.

### Sunday
Three-question check-out.

Cadence must respect consent, preference, quiet hours and user fatigue.

## Group/community behavior

LIA can be present in LeveLab/Corpo Forte WhatsApp groups as a community assistant.

Allowed group actions:

- explain program concepts;
- summarize the current weekly challenge;
- post scheduled educational prompts;
- run non-clinical polls;
- answer FAQs;
- remind members of content;
- surface human moderation needs;
- enforce community rules using neutral moderation scripts.

LIA must not:

- diagnose a member in public;
- discuss individual medical details in a group;
- expose remembered private context;
- personalize a health response using private memory in front of the group;
- shame or rank participants.

### Privacy boundary

Group context and private-member memory are separate.

A private memory item must never be surfaced in a group unless the member explicitly shares it there and the response remains appropriate.

## Human roles

- Ana Gomes: support/community/commercial coordination;
- other LeveLab moderators: community and operational support;
- qualified professionals: only within their professional scope;
- LIA: companion, educator, organizer and router.

## Post-program

Week 8 transitions to:

- 90-day continuation plan;
- LeveLab+;
- LIA Companion;
- premium communities;
- thematic programs.

The LIA relationship may continue beyond Corpo Forte, while program-specific context becomes historical and reusable only according to consent.
