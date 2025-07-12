import { Module } from "@nestjs/common";
import { DocumentModule } from "./document/document.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [DocumentModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
