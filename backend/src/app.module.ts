import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { DocumentModule } from "./document/document.module";
import { PrismaModule } from "./prisma/prisma.module";
import { WebSocketModule } from "./websocket/websocket.module";

@Module({
  imports: [EventEmitterModule.forRoot(), DocumentModule, WebSocketModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
