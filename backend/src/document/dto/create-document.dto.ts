import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateDocumentDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string;
}