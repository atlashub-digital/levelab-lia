import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class ChatRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(12000)
  message!: string;

  @IsOptional()
  @IsIn(["web", "whatsapp", "group", "chatwoot"])
  channel?: "web" | "whatsapp" | "group" | "chatwoot";

  @IsOptional()
  @IsString()
  @MaxLength(128)
  memberId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  conversationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  groupId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  programId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  moduleId?: string;
}
