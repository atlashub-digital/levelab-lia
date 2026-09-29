import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ChatRequestDto } from "./chat.dto";
import { ChatService } from "./chat.service";
import { ServiceTokenGuard } from "./service-token.guard";

@Controller("api/v1")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("chat")
  @UseGuards(ServiceTokenGuard)
  chat(@Body() body: ChatRequestDto) {
    return this.chatService.chat(body);
  }
}
