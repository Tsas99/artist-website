'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import WorkInfoEditor, {
  type Work,
} from '@/components/admin/WorkInfoEditor';

import WorkImagesManager from '@/components/admin/WorkImagesManager';
import WorkPublishToggle from '@/components/admin/WorkPublishToggle';
import DeleteWork from '@/components/admin/DeleteWork';

export default function AdminWorkDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [work, setWork] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    async function loadWork() {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(
          `http://localhost:3001/works/${id}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load work');
        }

        const data: Work = await response.json();

        setWork(data);
      } catch (error) {
        console.error(error);
        setError('Work could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    loadWork();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <p className="text-sm text-neutral-500">
            Loading work...
          </p>
        </div>
      </main>
    );
  }

  if (!work) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <p className="text-sm text-red-600">
            {error || 'Work not found.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push('/admin/works')}
              className="mb-4 text-sm text-neutral-500 transition hover:text-neutral-950"
            >
              ← Back to works
            </button>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              {work.title}
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage artwork
            </p>
          </div>

          <WorkPublishToggle
            work={work}
            onWorkChange={setWork}
            onError={setError}
          />
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-8">


          <WorkInfoEditor
            work={work}
            onWorkChange={setWork}
            onError={setError}
          />
          <WorkImagesManager
            work={work}
            onWorkChange={setWork}
            onError={setError}
          />
        </div>

      </div>
    </main>
  );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';

// type Work = {
//   id: number;
//   title: string;
//   slug: string;
//   description: string | null;
//   imageUrl: string | null;
//   imageUrls: string[];
//   mediums: string[];
//   eventName: string | null;
//   theme: string | null;
//   place: string | null;
//   material: string | null;
//   dimensions: string | null;
//   year: number | null;
//   isPublished: boolean;
// };
// type UploadedImage = {
//   imageUrl: string;
//   publicId: string;
// };

// type EditableField =
//   | 'title'
//   | 'slug'
//   | 'mediums'
//   | 'eventName'
//   | 'theme'
//   | 'place'
//   | 'material'
//   | 'dimensions'
//   | 'year'
//   | 'description';

// export default function AdminWorkDetailPage() {
//   const params = useParams();
//   const router = useRouter();

//   const id = params?.id as string;

//   const [work, setWork] = useState<Work | null>(null);
//   const [editingField, setEditingField] =
//     useState<EditableField | null>(null);

//   const [editValue, setEditValue] = useState('');

//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   const [newImages, setNewImages] = useState<UploadedImage[]>([]);
//   const [isUploading, setIsUploading] = useState(false);

//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!id) {
//       return;
//     }

//     async function loadWork() {
//       try {
//         setIsLoading(true);
//         setError('');

//         const response = await fetch(
//           `http://localhost:3001/works/${id}`,
//         );

//         if (!response.ok) {
//           throw new Error('Failed to load work');
//         }

//         const data: Work = await response.json();

//         setWork(data);
//       } catch (err) {
//         console.error(err);
//         setError('Work could not be loaded.');
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     loadWork();
//   }, [id]);

//   function startEditing(field: EditableField) {
//     if (!work) return;

//     setEditingField(field);

//     if (field === 'mediums') {
//       setEditValue(work.mediums.join(', '));
//       return;
//     }

//     if (field === 'year') {
//       setEditValue(work.year ? String(work.year) : '');
//       return;
//     }

//     setEditValue(work[field] ?? '');
//   }

//   function cancelEditing() {
//     setEditingField(null);
//     setEditValue('');
//   }

//   async function saveField(field: EditableField) {
//     if (!work) return;

//     setIsSaving(true);
//     setError('');

//     let value: string | number | string[] | null;

//     if (field === 'mediums') {
//       value = editValue
//         .split(',')
//         .map((item) => item.trim())
//         .filter(Boolean);
//     } else if (field === 'year') {
//       value = editValue ? Number(editValue) : null;
//     } else {
//       value = editValue.trim() || null;
//     }

//     try {
//       const response = await fetch(
//         `http://localhost:3001/works/${work.id}`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             [field]: value,
//           }),
//         },
//       );

//       if (!response.ok) {
//         const errorData = await response.text();

//         console.error('Update failed:', errorData);

//         throw new Error(errorData || 'Failed to update field');
//       }

//       const updatedWork: Work = await response.json();

//       setWork(updatedWork);
//       setEditingField(null);
//       setEditValue('');
//     } catch (err) {
//       console.error(err);
//       setError('Changes could not be saved.');
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   async function togglePublished() {
//     if (!work) return;

//     try {
//       setError('');

//       const response = await fetch(
//         `http://localhost:3001/works/${work.id}`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             isPublished: !work.isPublished,
//           }),
//         },
//       );

//       if (!response.ok) {
//         throw new Error('Failed to update publish status');
//       }

//       const updatedWork: Work = await response.json();
//       setWork(updatedWork);
//     } catch (err) {
//       console.error(err);
//       setError('Publish status could not be changed.');
//     }
//   }

//   if (isLoading) {
//     return (
//       <main className="min-h-screen bg-neutral-50">
//         <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
//           <p className="text-sm text-neutral-500">
//             Loading work...
//           </p>
//         </div>
//       </main>
//     );
//   }

//   if (!work) {
//     return (
//       <main className="min-h-screen bg-neutral-50">
//         <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
//           <p className="text-sm text-red-600">
//             {error || 'Work not found.'}
//           </p>
//         </div>
//       </main>
//     );
//   }

//   const fields: {
//     field: EditableField;
//     label: string;
//     multiline?: boolean;
//   }[] = [
//       { field: 'title', label: 'Title' },
//       { field: 'slug', label: 'Slug' },
//       { field: 'mediums', label: 'Medium' },
//       { field: 'year', label: 'Year' },
//       { field: 'eventName', label: 'Event name' },
//       { field: 'theme', label: 'Theme' },
//       { field: 'place', label: 'Place' },
//       { field: 'material', label: 'Material' },
//       { field: 'dimensions', label: 'Dimensions' },
//       {
//         field: 'description',
//         label: 'Description',
//         multiline: true,
//       },
//     ];

//   function displayValue(field: EditableField) {
//     if (!work) {
//       return 'Not added';
//     }

//     if (field === 'mediums') {
//       return work.mediums.length
//         ? work.mediums.join(', ')
//         : 'Not added';
//     }

//     if (field === 'year') {
//       return work.year ? String(work.year) : 'Not added';
//     }

//     return work[field] || 'Not added';
//   }

//   async function handleImagesUpload(files: FileList) {
//     if (!work) return;

//     setIsUploading(true);
//     setError('');

//     try {
//       const uploaded: UploadedImage[] = [];

//       for (const file of Array.from(files)) {
//         const formData = new FormData();
//         formData.append('file', file);

//         const response = await fetch('http://localhost:3001/upload/image', {
//           method: 'POST',
//           body: formData,
//         });

//         if (!response.ok) {
//           throw new Error('Image upload failed');
//         }

//         const data = await response.json();

//         uploaded.push({
//           imageUrl: data.imageUrl,
//           publicId: data.publicId,
//         });
//       }

//       const updatedImageUrls = [
//         ...work.imageUrls,
//         ...uploaded.map((image) => image.imageUrl),
//       ];

//       const updateResponse = await fetch(
//         `http://localhost:3001/works/${work.id}`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             imageUrls: updatedImageUrls,
//           }),
//         },
//       );

//       if (!updateResponse.ok) {
//         throw new Error('Failed to update gallery');
//       }

//       const updatedWork: Work = await updateResponse.json();

//       setWork(updatedWork);
//       setNewImages((current) => [...current, ...uploaded]);
//     } catch (err) {
//       console.error(err);
//       setError('Images could not be uploaded.');
//     } finally {
//       setIsUploading(false);
//     }
//   }

//   async function setCoverImage(url: string) {
//     if (!work) return;

//     try {
//       const response = await fetch(
//         `http://localhost:3001/works/${work.id}`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             imageUrl: url,
//           }),
//         },
//       );

//       if (!response.ok) {
//         throw new Error('Failed to change cover image');
//       }

//       const updatedWork: Work = await response.json();
//       setWork(updatedWork);
//     } catch (err) {
//       console.error(err);
//       setError('Cover image could not be changed.');
//     }
//   }

//   async function removeImageFromGallery(url: string) {
//     if (!work) return;

//     const updatedImageUrls = work.imageUrls.filter(
//       (image) => image !== url,
//     );

//     const newCover =
//       work.imageUrl === url
//         ? updatedImageUrls[0] ?? null
//         : work.imageUrl;

//     try {
//       const response = await fetch(
//         `http://localhost:3001/works/${work.id}`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             imageUrls: updatedImageUrls,
//             imageUrl: newCover,
//           }),
//         },
//       );

//       if (!response.ok) {
//         throw new Error('Failed to remove image');
//       }

//       const updatedWork: Work = await response.json();
//       setWork(updatedWork);
//     } catch (err) {
//       console.error(err);
//       setError('Image could not be removed.');
//     }
//   }


//   return (
//     <main className="min-h-screen bg-neutral-50">
//       <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
//         <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
//           <div>
//             <button
//               type="button"
//               onClick={() => router.push('/admin/works')}
//               className="mb-4 text-sm text-neutral-500 transition hover:text-neutral-950"
//             >
//               ← Back to works
//             </button>

//             <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
//               {work.title}
//             </h1>

//             <p className="mt-2 text-sm text-neutral-500">
//               Manage artwork
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={togglePublished}
//             className={`rounded-full px-4 py-2 text-sm font-medium transition ${work.isPublished
//               ? 'bg-green-50 text-green-700 hover:bg-green-100'
//               : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
//               }`}
//           >
//             {work.isPublished ? 'Published' : 'Draft'}
//           </button>
//         </div>

//         {error && (
//           <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         {work.imageUrl && (
//           <div className="mb-8 overflow-hidden rounded-2xl bg-neutral-100">
//             <img
//               src={work.imageUrl}
//               alt={work.title}
//               className="max-h-[600px] w-full object-contain"
//             />
//           </div>
//         )}

//         <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
//           {fields.map(({ field, label, multiline }, index) => {
//             const isEditing = editingField === field;

//             return (
//               <div
//                 key={field}
//                 className={`p-5 sm:p-6 ${index !== fields.length - 1
//                   ? 'border-b border-neutral-200'
//                   : ''
//                   }`}
//               >
//                 <div className="flex items-start justify-between gap-6">
//                   <div className="min-w-0 flex-1">
//                     <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
//                       {label}
//                     </p>

//                     {isEditing ? (
//                       <div className="mt-3">
//                         {multiline ? (
//                           <textarea
//                             value={editValue}
//                             onChange={(event) =>
//                               setEditValue(event.target.value)
//                             }
//                             className="min-h-48 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
//                           />
//                         ) : (
//                           <input
//                             type={
//                               field === 'year'
//                                 ? 'number'
//                                 : 'text'
//                             }
//                             value={editValue}
//                             onChange={(event) =>
//                               setEditValue(event.target.value)
//                             }
//                             className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
//                           />
//                         )}

//                         {field === 'mediums' && (
//                           <p className="mt-2 text-xs text-neutral-500">
//                             Separate multiple mediums with commas.
//                           </p>
//                         )}

//                         <div className="mt-3 flex gap-2">
//                           <button
//                             type="button"
//                             disabled={isSaving}
//                             onClick={() => saveField(field)}
//                             className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
//                           >
//                             {isSaving ? 'Saving...' : 'Save'}
//                           </button>

//                           <button
//                             type="button"
//                             disabled={isSaving}
//                             onClick={cancelEditing}
//                             className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <p
//                         className={`mt-2 text-sm leading-7 ${displayValue(field) === 'Not added'
//                           ? 'text-neutral-400'
//                           : 'whitespace-pre-line text-neutral-800'
//                           }`}
//                       >
//                         {displayValue(field)}
//                       </p>
//                     )}
//                   </div>

//                   {!isEditing && (
//                     <button
//                       type="button"
//                       onClick={() => startEditing(field)}
//                       className="shrink-0 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
//                     >
//                       Edit
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </section>
//         <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-neutral-950">
//                 Images
//               </h2>

//               <p className="mt-1 text-sm text-neutral-500">
//                 Add images, choose a cover, or remove images from this work.
//               </p>
//             </div>

//             <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800">
//               {isUploading ? 'Uploading...' : 'Add images'}

//               <input
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 className="sr-only"
//                 disabled={isUploading}
//                 onChange={(event) => {
//                   const files = event.target.files;

//                   if (files && files.length > 0) {
//                     handleImagesUpload(files);
//                   }
//                 }}
//               />
//             </label>
//           </div>

//           {work.imageUrls.length > 0 ? (
//             <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
//               {work.imageUrls.map((url, index) => {
//                 const isCover = work.imageUrl === url;

//                 return (
//                   <div
//                     key={`${url}-${index}`}
//                     className="overflow-hidden rounded-2xl border border-neutral-200"
//                   >
//                     <div className="relative aspect-[4/3] bg-neutral-100">
//                       <img
//                         src={url}
//                         alt={`${work.title} image ${index + 1}`}
//                         className="h-full w-full object-cover"
//                       />

//                       {isCover && (
//                         <span className="absolute left-3 top-3 rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">
//                           Cover
//                         </span>
//                       )}
//                     </div>

//                     <div className="space-y-2 p-4">
//                       {!isCover && (
//                         <button
//                           type="button"
//                           onClick={() => setCoverImage(url)}
//                           className="min-h-11 w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
//                         >
//                           Choose as cover
//                         </button>
//                       )}

//                       {isCover && (
//                         <div className="flex min-h-11 items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700">
//                           Cover photo
//                         </div>
//                       )}

//                       <button
//                         type="button"
//                         onClick={() => removeImageFromGallery(url)}
//                         className="min-h-11 w-full rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <p className="mt-6 text-sm text-neutral-500">
//               No images added yet.
//             </p>
//           )}
//         </section>
//       </div>
//     </main>
//   );
// }