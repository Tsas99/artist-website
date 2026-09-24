import NewsForm from '@/components/admin/news/NewsForm';

export default function NewNewsPage() {
    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
            <h1 className="mb-10 text-xl font-medium">
                Add News
            </h1>

            <NewsForm />
        </main>
    );
}