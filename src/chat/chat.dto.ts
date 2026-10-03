import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

/** One prior turn of the current session (short-term memory, not persisted). */
export class ChatTurnDto {
  @IsIn(["user", "assistant"])
  role!: "user" | "assistant";

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  text!: string;
}

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

  /** Prior turns of the current session, oldest first, excluding `message`. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  history?: ChatTurnDto[];
}
