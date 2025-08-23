import { Controller, Post, Body, Get, Param, Put, Patch } from "@nestjs/common";
import { DocumentService } from "./document.service";
import type { CreateDocumentDto } from "./dto/create-document.dto";
import type { UpdateDocumentDto } from "./dto/update-document.dto";

@Controller("documents")
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentService.update(+id, updateDocumentDto);
  }
}
