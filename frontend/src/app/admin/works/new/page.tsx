'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type UploadedImage = {
  imageUrl: string;
  publicId: string;
};

export default function NewWorkPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [year, setYear] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const [eventName, setEventName] = useState('');
  const [theme, setTheme] = useState('')

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(createSlug(value));
  }

  async function handleImagesUpload(files: FileList) {
    setIsUploading(true);
    setError('');

    try {
      const uploadedImages: UploadedImage[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          'http://localhost:3001/upload/image',
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error('Image upload failed');
        }

        const data = await response.json();

        uploadedImages.push({
          imageUrl: data.imageUrl,
          publicId: data.publicId,
        });
      }

      setImages((current) => [...current, ...uploadedImages]);
    } catch (err) {
      console.error(err);
      setError('Images could not be uploaded.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveImage(image: UploadedImage) {
    setError('');

    try {
      const response = await fetch(
        'http://localhost:3001/upload/image',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicId: image.publicId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages((current) =>
        current.filter(
          (item) => item.publicId !== image.publicId,
        ),
      );

      if (imageUrl === image.imageUrl) {
        setImageUrl('');
      }
    } catch (err) {
      console.error(err);
      setError('Image could not be removed.');
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (images.length > 0 && !imageUrl) {
      setError('Please choose a cover photo.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:3001/works',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            slug,
            description: description || undefined,
            imageUrl: imageUrl || undefined,
            imageUrls: images.map(
              (image) => image.imageUrl,
            ),
            place: place || undefined,
            material: material || undefined,
            dimensions: dimensions || undefined,
            year: year ? Number(year) : undefined,
            eventName: eventName || undefined,
            theme: theme || undefined,
            isPublished,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to create work');
      }

      router.push('/works');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Work could not be added.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10';

  const labelClass =
    'text-sm font-medium text-neutral-800';

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm text-neutral-500">
            Admin / Works
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Add New Work
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
            Add artwork information, upload images, and
            choose the cover photo before publishing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-neutral-950">
              Artwork information
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className={labelClass}
                >
                  Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    handleTitleChange(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                  placeholder="Artwork title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="slug"
                  className={labelClass}
                >
                  Slug
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  className={inputClass}
                  placeholder="artwork-title"
                  required
                />

                <p className="mt-2 text-xs text-neutral-500">
                  Used in the artwork page URL.
                </p>
              </div>

              <div>
                <label
                  htmlFor="place"
                  className={labelClass}
                >
                  Place / Exhibition
                </label>

                <input
                  id="place"
                  name="place"
                  type="text"
                  value={place}
                  onChange={(event) =>
                    setPlace(event.target.value)
                  }
                  className={inputClass}
                  placeholder="Ulaanbaatar Biennale, Mongolia"
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className={labelClass}
                >
                  Year
                </label>

                <input
                  id="year"
                  name="year"
                  type="number"
                  value={year}
                  onChange={(event) =>
                    setYear(event.target.value)
                  }
                  className={inputClass}
                  placeholder="2026"
                />
              </div>

              <div>
                <label
                  htmlFor="material"
                  className={labelClass}
                >
                  Material
                </label>

                <input
                  id="material"
                  name="material"
                  type="text"
                  value={material}
                  onChange={(event) =>
                    setMaterial(event.target.value)
                  }
                  className={inputClass}
                  placeholder="Steel, acrylic, water"
                />
              </div>

              <div>
                <label
                  htmlFor="dimensions"
                  className={labelClass}
                >
                  Dimensions
                </label>

                <input
                  id="dimensions"
                  name="dimensions"
                  type="text"
                  value={dimensions}
                  onChange={(event) =>
                    setDimensions(event.target.value)
                  }
                  className={inputClass}
                  placeholder="120 × 80 × 40 cm"
                />
              </div>
              <div>
                <label htmlFor="eventName"
                className='text-sm font-medium text-neutral-800'
                >
                  Event name
                </label>
                <input type="text" id='eventName' name='evenName' value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                  placeholder='Spirit of Gobi Contemporary Art Festival' 
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                />

              </div>
              <div>
                <label htmlFor="theme" className='text-sm font-medium text-neutral-800'>Theme</label>
                <input type="text" id='theme' name='theme' value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  placeholder='Festival or exhibition theme'
                   className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
 />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className={labelClass}
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  className={`${inputClass} min-h-40 resize-y`}
                  placeholder="Artwork description..."
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Images
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Upload multiple images and choose one
                  cover photo.
                </p>
              </div>

              {images.length > 0 && (
                <p className="text-sm text-neutral-500">
                  {images.length}{' '}
                  {images.length === 1
                    ? 'image'
                    : 'images'}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label
                htmlFor="images"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center transition hover:border-neutral-500 hover:bg-neutral-100"
              >
                <span className="text-sm font-medium text-neutral-900">
                  Choose images
                </span>

                <span className="mt-1 text-xs text-neutral-500">
                  Select one or multiple artwork images
                </span>

                <input
                  id="images"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const files = event.target.files;

                    if (
                      files &&
                      files.length > 0
                    ) {
                      handleImagesUpload(files);
                    }
                  }}
                />
              </label>

              {isUploading && (
                <p className="mt-3 text-sm text-neutral-600">
                  Uploading images...
                </p>
              )}
            </div>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => {
                  const isCover =
                    imageUrl === image.imageUrl;

                  return (
                    <div
                      key={image.publicId}
                      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                        <img
                          src={image.imageUrl}
                          alt={`Artwork preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {isCover && (
                          <span className="absolute left-3 top-3 rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">
                            Cover
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 p-4">
                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() =>
                              setImageUrl(
                                image.imageUrl,
                              )
                            }
                            className="min-h-11 w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                          >
                            Choose as cover
                          </button>
                        ) : (
                          <div className="flex min-h-11 items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700">
                            Cover photo
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveImage(image)
                          }
                          className="min-h-11 w-full rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(event) =>
                  setIsPublished(
                    event.target.checked,
                  )
                }
                className="mt-1 h-4 w-4 rounded border-neutral-300"
              />

              <div>
                <label
                  htmlFor="isPublished"
                  className="text-sm font-medium text-neutral-900"
                >
                  Publish this project
                </label>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Published works can be displayed on the
                  public website.
                </p>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="min-h-12 rounded-xl border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting || isUploading
              }
              className="min-h-12 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? 'Adding work...'
                : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
// "use client";

// import { FormEvent, useState } from "react";
// import { useRouter } from "next/navigation";

// type UploadedImage = {
//   imageUrl:string;
//   publicId:string;
// }

// export default function NewWorkPage() {
//   const router = useRouter();

//   const [title, setTitle] = useState("");
//   const [slug, setSlug] = useState("");
//   const [place, setPlace] = useState("");
//   const [year, setYear] = useState("");
//   const [description, setDescription] = useState("");
//   const [material, setMaterial] = useState('');
//   const [dimensions, setDimensions] = useState('');
//   const [images, setImages] = useState<UploadedImage[]>([])
//   const [imageUrl, setImageUrl] = useState("");
//   const [imageUrls, setImageUrls] = useState<string[]>([]);
//   const [isPublished, setIsPublished] = useState(false);

//   const [isUploading, setIsUploading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");

 



//   function createSlug(value: string) {
//     return value
//       .toLowerCase()
//       .trim()
//       .replace(/['’]/g, "")
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");
//   }

//   function handleTitleChange(value: string) {
//     setTitle(value);
//     setSlug(createSlug(value));
//   }
//   async function handleImagesUpload(files: FileList) {
//     setIsUploading(true);
//     setError('');

//     try {
//       const uploadedImages: UploadedImage[] = [];
//       for (const file of Array.from(files)) {
//         const formData = new FormData();
//         formData.append('file', file);

//         const response = await fetch(
//           'http://localhost:3001/upload/image',
//           {
//             method:'POST',
//             body: formData,
//           },
//         );

//         if (!response.ok) {
//           throw new Error('Image upload failed');
//         }
//         const data = await response.json();
//         uploadedImages.push({
//           imageUrl: data.imageUrl,
//           publicId: data.publicId,
//         });   
//       }

//       setImages((current) => [
//         ...current,
//         ...uploadedImages,
//       ]);
//     } catch (err) {
//       console.error(err);
//       setError('Images could not be uploaded.');
//     } finally {
//       setIsUploading(false);
//     }
//   }
  
//   async function handleRemoveImage(image: UploadedImage) {
//     try {
//       const response = await fetch('http://localhost:3001/upload/image', {
//         method:'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           publicId: image.publicId,
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to delete image');
//       }

//       setImages((current) => 
//       current.filter((item) => item.publicId !== image.publicId),

//     );
      
//       if (imageUrl === image.imageUrl) {
//         setImageUrl('');
//       }
//     } catch (err) {
//       console.error(err);
//       setError('image could not be removed');
//     }
//   }

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     if (images.length > 0 && !imageUrl) {
//       setError('Please choose a cover photo');
//       return;
//     }

//     setIsSubmitting(true);
//     setError("");

//     try {
//       const response = await fetch("http://localhost:3001/works", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           title,
//           slug,
//           description: description || undefined,
//           material: material || undefined,
//           dimensions: dimensions || undefined,
//           imageUrl: imageUrl || undefined,
//           imageUrls: images.map((image) => image.imageUrl),
//           place: place || undefined,
//           year: year ? Number(year) : undefined,
//           isPublished,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to create work");
//       }

//       router.push("/works");
//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       setError("Work could not be added.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <main className="min-h-screen bg-neutral-50">
//       <h1 className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">Add New Work</h1>

//       <form onSubmit={handleSubmit}>
//         <div>
//           <label htmlFor="title">Title</label>
//           <input
//             id="title"
//             name="title"
//             type="text"
//             value={title}
//             onChange={(event) => handleTitleChange(event.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="slug">Slug</label>
//           <input
//             id="slug"
//             name="slug"
//             type="text"
//             value={slug}
//             onChange={(event) => setSlug(event.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="material">Material</label>
//           <input 
//               type="text"
//               id="material"
//               name="matrial"
//               value={material}
//               onChange={(event) => setMaterial(event.target.value)}
//               placeholder="Steel, acrylic, wood"

//             />
//         </div>
//         <div>
//           <label htmlFor="dimensions">Dimensions</label>
//           <input 
//             type="text"
//             id="dimensions"
//             name="dimensions"
//             value={dimensions}
//             onChange={(event) => setDimensions(event.target.value)}
//             placeholder="120 x 80 x 40 cm"
//            />
//         </div>
//         <div>
//           <label htmlFor="place">Place / Exhibition</label>
//           <input
//             id="place"
//             name="place"
//             type="text"
//             value={place}
//             onChange={(event) => setPlace(event.target.value)}
//           />
//         </div>

//         <div>
//           <label htmlFor="year">Year</label>
//           <input
//             id="year"
//             name="year"
//             type="number"
//             value={year}
//             onChange={(event) => setYear(event.target.value)}
//           />
//         </div>

//         <div>
//           <label htmlFor="description">Description</label>
//           <textarea
//             id="description"
//             name="description"
//             value={description}
//             onChange={(event) => setDescription(event.target.value)}
//           />
//         </div>

//         <div>
//           <label htmlFor="image">Image</label>
//           <input
//             id="image"
//             name="image"
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={(event) => {
//               const files = event.target.files;

//               if (files && files.length > 0) {
//                 handleImagesUpload(files);
//               }
//             }}
//           />

//           {isUploading && <p>Uploading image...</p>}

//           {images.length > 0  && (
//             <div className="mt-6" >
//               <p >{images.length} Image uploaded successfully.</p>
//               {images.map((image, index) => (
//                 <div key={image.publicId}>
//                   <img src={image.imageUrl} 
//                     alt={ `Artwork preview ${index + 1}`}
//                     width={200}
//                    />
//                   {imageUrl === imageUrl ? (
//                     <p>Cover photo</p>
//                   ) :(
//                     <button
//                      type="button"
//                      onClick={() => setImageUrl(image.imageUrl)}
//                     > 
//                      Choose as cover
//                      </button>
//                   ) }
//                   <button
//                      type="button"
//                      onClick={() => handleRemoveImage(image)}
//                      > 
//                      Remove
//                   </button> 
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div>
//           <label htmlFor="isPublished">
//             <input
//               id="isPublished"
//               name="isPublished"
//               type="checkbox"
//               checked={isPublished}
//               onChange={(event) => setIsPublished(event.target.checked)}
//             />
//             Published
//           </label>
//         </div>

//         {error && <p>{error}</p>}

//         <button type="submit" disabled={isSubmitting || isUploading}>
//           {isSubmitting ? "Adding..." : "Add Project"}
//         </button>
//       </form>
//     </main>
//   );
// }
