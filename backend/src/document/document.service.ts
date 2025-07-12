import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../prisma/prisma.service";
import type { DocumentUpdatedEvent } from "../types/events";
import type { CreateDocumentDto } from "./dto/create-document.dto";
import type { UpdateDocumentDto } from "./dto/update-document.dto";

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async create(createDocumentDto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        ...createDocumentDto,
        userId: 1,
      },
    });
  }

  async findAll() {
    return this.prisma.document.findMany({
      orderBy: { updatedAt: "desc" },
    });
  }

  async findOne(id: number) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    await this.findOne(id);

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
    });

    this.eventEmitter.emit("document.updated", {
      documentId: updatedDocument.id,
      content: updatedDocument.content,
    });

    return updatedDocument;
  }

  async publish(id: number) {
    await this.findOne(id);

    return this.prisma.document.update({
      where: { id },
      data: { published: true },
    });
  }
}
