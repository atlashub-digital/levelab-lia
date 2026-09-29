export type MemorySensitivity = "standard" | "sensitive";

export type MemoryScope =
  | "session"
  | "private_member"
  | "program"
  | "group_social";

export interface MemoryCandidate {
  key: string;
  value: unknown;
  purpose: string;
  scope: MemoryScope;
  sensitivity: MemorySensitivity;
  consentRequired: boolean;
  groupId?: string;
  ttl?: string;
}

export interface MemoryProvider {
  propose(memberId: string, candidate: MemoryCandidate): Promise<void>;
  search(memberId: string, query: string): Promise<MemoryCandidate[]>;
  forget(memberId: string, key: string): Promise<void>;
}

/**
 * v0.3 contract only.
 *
 * Persistence is intentionally not implemented inside LIA Core yet.
 * The LeveLab data layer remains the owner of consented memory.
 *
 * group_social rules:
 * - scoped to one group;
 * - derived only from public interactions in that group;
 * - may contain public display name / nickname, conversational familiarity,
 *   public recent topics and interaction preferences;
 * - must never contain private program goals, symptoms, diagnoses,
 *   medication, private conversations or hidden sensitive inferences.
 */
