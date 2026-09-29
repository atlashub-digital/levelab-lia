export interface LiaMemberContext {
  memberId: string;
  displayName?: string;
  locale?: string;
  entitlements?: string[];
  activePrograms?: Array<{
    programId: string;
    version?: string;
    currentModuleId?: string;
  }>;
  corpoForte?: {
    week?: number;
    moduleId?: string;
    goal?: string;
    targetCapability?: string;
    mainBarrier?: string;
    minimumViableAction?: string;
    selectedProgressSignals?: string[];
    currentCommitment?: string;
    checkInPreference?: string;
  };
}

export type MemberContextResult =
  | { status: "not_requested" }
  | { status: "blocked_for_group" }
  | { status: "available"; context: LiaMemberContext }
  | { status: "unavailable"; reason: string };
