export type NewsItem = {
  id: number;
  title: string;
  slug: string;
category: string | null;
  date: string | null;
  location: string | null;
  description: string | null;

  posterUrl: string | null;
  posterPublicId: string | null;

  externalLink: string | null;
  isPublished: boolean;

  createdAt: string;
  updatedAt: string;
};