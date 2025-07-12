import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { PrismaModule } from "../prisma/prisma.module";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
