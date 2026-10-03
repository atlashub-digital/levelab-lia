import { Module } from "@nestjs/common";
import { LeveLabContextClient } from "./context.client";

@Module({
  providers: [LeveLabContextClient],
  exports: [LeveLabContextClient],
})
export class ContextModule {}
