export class CreateWorkMediaDto {
    url!:string;
    publicId!: string;
    type!: 'image' | 'video';
    sortOrder?: number;
    workId!: number;
}
