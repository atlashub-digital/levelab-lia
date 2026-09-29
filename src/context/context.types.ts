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

export type GroupFamiliarity = "new" | "known" | "regular";

export interface LiaGroupSocialContext {
  groupId: string;
  memberId?: string;

  /**
   * Only names publicly visible/used in this group.
   * Never infer or copy a private nickname into a group.
   */
  displayName?: string;
  preferredGroupName?: string;
  role?: "member" | "moderator" | "admin";

  /**
   * Conversational rapport, not psychological profiling.
   * Derived only from public interactions in this group.
   */
  familiarity?: GroupFamiliarity;
  interactionStyle?: {
    tone?: "direct" | "conversational" | "playful" | "reserved";
    verbosity?: "brief" | "balanced" | "detailed";
    emojiUse?: "low" | "normal" | "high";
  };

  publicHistory?: {
    summary?: string;
    recentTopics?: string[];
    lastInteractionAt?: string;
    interactionCount?: number;
  };

  groupProgramContext?: {
    programId?: string;
    moduleId?: string;
    currentTheme?: string;
  };
}

export type MemberContextResult =
  | { status: "not_requested" }
  | { status: "private_available"; context: LiaMemberContext }
  | { status: "group_safe_available"; context: LiaGroupSocialContext }
  | { status: "unavailable"; reason: string };
