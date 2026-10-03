export type LiaAction = "reply" | "handoff" | "silent" | "moderate";

export type HandoffQueue =
  | "support"
  | "nutrition"
  | "exercise"
  | "medical"
  | "behavior";

export interface LiaResponse {
  correlationId: string;
  action: LiaAction;
  messages?: Array<{
    type: "text" | "audio" | "image";
    content?: string;
    mediaRef?: string;
  }>;
  handoff?: {
    queue: HandoffQueue;
    reasonCode: string;
    summary: string;
  };
  memoryCandidates?: Array<{
    key: string;
    value: unknown;
    consentRequired: boolean;
    ttl?: string;
  }>;
}
