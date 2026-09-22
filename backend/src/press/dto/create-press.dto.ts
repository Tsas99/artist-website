export type CreatePressMediaInput = {
    url : string;
    publicId : string; 
    sortOrder? : number;
}

export class CreatePressDto {
    name!: string;
    slug!: string;

    details?: string;
    link?: string; 

    coverUrl?: string;
    coverPublicId? : string;

    isPublished?: boolean;

    media?: CreatePressMediaInput[];
}