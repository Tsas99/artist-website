import PressForm from '@/components/admin/press/PressForm';

export default function NewPressPage() {
    return (
        <main className="mx-auto max-w-5xl p-6 sm:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-medium tracking-tight text-neutral-950">
                    New Press
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    Add a catalogue,
                    interview, article or
                    curatorial text.
                </p>
            </div>

            <PressForm />
        </main>
    );
}