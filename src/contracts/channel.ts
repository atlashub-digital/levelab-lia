export type ChannelType = "web" | "whatsapp" | "group" | "chatwoot";
export type MessageType = "text" | "audio" | "image" | "document" | "event";

export interface ChannelInboundEvent {
  eventId: string;
  channel: ChannelType;
  externalConversationId: string;
  externalUserId?: string;
  tenantId: string;
  timestamp: string;
  message: {
    type: MessageType;
    text?: string;
    mediaRef?: string;
  };
  programContext?: {
    programId?: string;
    moduleId?: string;
  };
}
