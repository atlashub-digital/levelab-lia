# LIA Tool Contracts — v0.1

LIA never accesses LeveLab PostgreSQL directly. All business state comes through the Atendimento.Center Tool Gateway.

## Initial tools

### levelab.create_lead
Creates or resolves a lead/member identity from an approved channel context.

### levelab.get_member_context
Returns the minimum member profile needed for the current purpose.

### levelab.update_wellness_profile
Updates allowed onboarding/preferences fields. Must validate field allowlist.

### levelab.start_program
Starts an eligible LeveLab program for the member.

### levelab.get_today_plan
Returns the current approved program/day content.

### levelab.record_checkin
Stores a structured daily check-in.

### levelab.get_week_summary
Returns structured progress aggregates without inventing clinical conclusions.

### levelab.list_content
Returns approved/published content available to the member.

### levelab.request_human
Creates a handoff request with queue and concise context.

### levelab.get_entitlements
Returns product/program access.

## Tool rules

- writes require idempotency keys;
- tool calls are audited;
- output is structured;
- errors are deterministic;
- scopes are workspace-specific;
- no secret or database credential appears in a model-visible result.
