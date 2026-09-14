export type CreateWorkMediaInput = {
  url: string;
  publicId: string;
  type: 'image' | 'video';
  sortOrder?:number;
}; 
export class CreateWorkDto {
  title!: string;
  slug!: string;
  description?: string;
  mediums?: string[];
  imageUrl?: string;
  imageUrls?: string[];
  eventName?: string;
  theme?: string;
  place?: string;
  material?: string;
  dimensions?: string;
  year?: number;
  isPublished?: boolean;
  media?: CreateWorkMediaInput[]

}