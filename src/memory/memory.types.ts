export type MemorySensitivity = "standard" | "sensitive";

export interface MemoryCandidate {
  key: string;
  value: unknown;
  purpose: string;
  sensitivity: MemorySensitivity;
  consentRequired: boolean;
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
 * The LeveLab data layer remains the owner of consented program memory.
 */
