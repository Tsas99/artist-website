export class CreateCvEntryDto {
  year!: string;
  title!: string;
  details?: string;
  category!: string;
  sortOrder?: number;
}