import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";

@Module({
  imports: [PrismaModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
