import HomeSlideshow from "@/components/home/HomeSlideShow";


const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

type HomeMedia = {
  id: number;
  url: string;
  publicId: string;
  sortOrder: number;
  createdAt: string;
};

async function getHomeImages() {
  try {
    const response = await fetch(
      `${API_URL}/home-media`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    return (
      (await response.json()) as HomeMedia[]
    );
  } catch (error) {
    console.error(
      'Failed to load home images:',
      error,
    );

    return [];
  }
}

export default async function HomePage() {
  const images =
    await getHomeImages();

  return (
    <main className="w-full">
      <HomeSlideshow
        images={images}
      />
    </main>
  );
}