export class CreateWorkDto {
  title!: string;
  slug!: string;
  description?: string;
  imageUrl?: string;
  place?: string;
  year?: number;
  isPublished?: boolean;
 
}