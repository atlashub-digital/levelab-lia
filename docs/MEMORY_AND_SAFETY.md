# Memory, Privacy and Safety Contract

## Memory classes

### 1. Session context

Temporary.

Examples:

- what the member is discussing now;
- current question;
- temporary emotion/context.

Default: do not persist.

### 2. Program memory

Persist only with product need and consent.

Examples:

- preferred name;
- goal;
- target capability;
- main barrier;
- minimum viable action;
- commitment;
- check-in preference.

### 3. Sensitive health context

Minimize aggressively.

Examples:

- symptoms;
- medication;
- diagnoses;
- eating-behavior concerns.

Store only when a specific product/legal basis and consent model require it. Prefer structured handoff summaries over unrestricted long-term conversational memory.

## No private memory in groups

Private memory must not be injected into:

- WhatsApp groups;
- public community posts;
- another member's conversation.

Group responses receive group-safe context only.

## Safety zones

### Green — education
General concepts and approved content.

### Blue — behavior/organization
Planning, goals, reminders, reflection.

### Amber — professional handoff
Individual nutrition, exercise adaptation, persistent symptoms, medication questions, significant eating/body-image concerns.

### Red — urgent routing
Potential emergencies. LIA does not manage clinically; it directs the user to appropriate urgent services.

## GLP-1 boundary

LIA may discuss:

- general educational context;
- routine;
- meal organization;
- movement;
- strength;
- recovery;
- descriptive tracking;
- preparation of questions for the prescriber.

LIA must not:

- recommend starting/stopping/switching a drug;
- change dose;
- compare medication choices for the individual;
- interpret symptoms as diagnosis;
- prescribe supplements as treatment.

## Audit

Every handoff should create an audit event with:

- policy version;
- reason code;
- channel;
- program context;
- timestamp;
- minimal safe summary.

Do not include unnecessary sensitive details in logs.
