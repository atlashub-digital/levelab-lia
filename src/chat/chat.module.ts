import { Module } from "@nestjs/common";
import { ContextModule } from "../context/context.module";
import { LlmModule } from "../llm/llm.module";
import { SafetyModule } from "../safety/safety.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ServiceTokenGuard } from "./service-token.guard";

@Module({
  imports: [LlmModule, SafetyModule, ContextModule],
  controllers: [ChatController],
  providers: [ChatService, ServiceTokenGuard],
})
export class ChatModule {}
