import { OnEvent } from "@nestjs/event-emitter";
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WebSocketServer,
  WebSocketGateway as WSGateway,
} from "@nestjs/websockets";
import type { Server } from "ws";
import type { DocumentUpdatedEvent } from "../types/events";

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log("Client connected");
  }

  handleDisconnect(client: any) {
    console.log("Client disconnected");
  }

  @OnEvent("document.updated")
  handleDocumentUpdated(event: DocumentUpdatedEvent) {
    this.server.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          event: "documentUpdated",
          data: {
            documentId: event.documentId,
            content: event.content,
            source: "remote",
          },
        })
      );
    });
  }
}
