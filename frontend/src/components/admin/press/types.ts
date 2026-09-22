export type UploadedPressImage = {
    url: string;
    publicId: string;
};

export type PressFormData = {
    name: string;
    details: string;
    link: string;
    isPublished: boolean;
};

export type PressMedia = {
    id: number;
    url: string;
    publicId: string;
    sortOrder: number;
    pressId: number;
};

export type PressEntry = {
    id: number;
    name: string;
    slug: string;
    details: string | null;
    link: string | null;

    coverUrl: string | null;
    coverPublicId: string | null;

    isPublished: boolean;

    media: PressMedia[];
};