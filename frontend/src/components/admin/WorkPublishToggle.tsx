'use client';

import type { Work } from './WorkInfoEditor';

type Props = {
    work: Work;
    onWorkChange: (work: Work) => void;
    onError: (message: string) => void;
};

export default function WorkPublishToggle({
    work,
    onWorkChange,
    onError,
}: Props) {
    async function togglePublished() {
        try {
            onError('');

            const response = await fetch(
                `http://localhost:3001/works/${work.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        isPublished: !work.isPublished,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to update publish status');
            }

            const updatedWork: Work = await response.json();

            onWorkChange(updatedWork);
        } catch (error) {
            console.error(error);
            onError('Publish status could not be changed.');
        }
    }

    return (
        <button
            type="button"
            onClick={togglePublished}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${work.isPublished
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
        >
            {work.isPublished ? 'Published' : 'Draft'}
        </button>
    );
}