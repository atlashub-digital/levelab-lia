export type SafetyDisposition =
  | "allow"
  | "allow_with_boundary"
  | "handoff"
  | "urgent";

export interface SafetyAssessment {
  disposition: SafetyDisposition;
  reasonCode?: string;
  publicInstruction?: string;
}
