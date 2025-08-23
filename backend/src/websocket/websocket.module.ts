import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { WebSocketGateway } from "./websocket.gateway";

@Module({
  imports: [EventEmitterModule],
  providers: [WebSocketGateway],
})
export class WebSocketModule {}
