import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DocumentModule } from "./document/document.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [DocumentModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
