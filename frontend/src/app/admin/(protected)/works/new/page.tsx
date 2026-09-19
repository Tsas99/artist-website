'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-fetch';

type UploadedMedia = {
  url: string;
  publicId: string;
  type: 'image' | 'video';
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
  const [medium, setMedium] = useState('');

  const [eventName, setEventName] = useState('');
  const [theme, setTheme] = useState('');

  const [isPublished, setIsPublished] = useState(false);

  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [coverUrl, setCoverUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

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

  async function handleMediaUpload(files: FileList) {
    setIsUploading(true);
    setError('');

    try {
      const uploadedMedia: UploadedMedia[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();

        formData.append('file', file);

        const response = await adminFetch(
          '/api/admin/upload/media',
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!response.ok) {
          const message = await response.text();

          console.error('Upload failed:', message);

          throw new Error('Media upload failed');
        }

        const data: UploadedMedia = await response.json();

        uploadedMedia.push({
          url: data.url,
          publicId: data.publicId,
          type: data.type,
        });
      }

      setMedia((current) => [
        ...current,
        ...uploadedMedia,
      ]);
    } catch (err) {
      console.error(err);
      setError('Images or videos could not be uploaded.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveMedia(
    item: UploadedMedia,
  ) {
    setError('');

    try {
      const response = await adminFetch(
        '/api/admin/upload/media',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicId: item.publicId,
            type: item.type,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      setMedia((current) =>
        current.filter(
          (mediaItem) =>
            mediaItem.publicId !== item.publicId,
        ),
      );

      if (coverUrl === item.url) {
        setCoverUrl('');
      }
    } catch (err) {
      console.error(err);
      setError('Media could not be removed.');
    }
  }
  async function handleCancel() {
    if (isUploading || isSubmitting) {
      return;
    }
    if (media.length === 0) {
      router.back();
      return;
    }

    const confirmed = window.confirm(
      'Cancel this project? Uploaded images and videos will be deleted.',

    );
    if (!confirmed) {
      return;
    }
    setError('');
    try {
      for (const item of media) {
        const response = await adminFetch(
          '/api/admin/upload/media',
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              publicId: item.publicId,
              type: item.type,
            }),
          },
        );
        if (!response.ok) {
          throw new Error(
            `Failed to delete ${item.publicId}`,
          );
        }
      }
      setMedia([]);
      setCoverUrl('');
      router.back();
    } catch (err) {
      console.error('Cancel cleanup failed:', err,);
      setError(
        'Some uploaded media could not be removed. Please try again.',
      );
      setIsCancelling(true);
    }
    finally {
      setIsCancelling(false);

    }
  }
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const hasImages = media.some(
      (item) => item.type === 'image',
    );

    if (hasImages && !coverUrl) {
      setError('Please choose a cover photo.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await adminFetch(
        '/api/admin/works',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            title,
            slug,

            description:
              description.trim() || undefined,

            imageUrl:
              coverUrl || undefined,

            place:
              place.trim() || undefined,

            material:
              material.trim() || undefined,

            dimensions:
              dimensions.trim() || undefined,

            year:
              year ? Number(year) : undefined,

            eventName:
              eventName.trim() || undefined,

            theme:
              theme.trim() || undefined,

            mediums: medium
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),

            isPublished,


            media: media.map((item, index) => ({
              url: item.url,
              publicId: item.publicId,
              type: item.type,
              sortOrder: index,
            })),
          }),
        },
      );

      if (!response.ok) {
        let message =
          'Work could not be added.';

        try {
          const data = await response.json();

          if (
            typeof data.message === 'string'
          ) {
            message = data.message;
          }
        } catch {

        }

        if (response.status === 409) {
          setError(
            'This slug is already in use. Please choose a different slug.',
          );
          return;
        }

        throw new Error(message);
      }

      const createdWork = await response.json();

      console.log(
        'Work created successfully:',
        createdWork,
      );

      router.push('/admin/works');
      router.refresh();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'Work could not be added.',
        );
      }
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
            Add artwork information, upload images or
            videos, and choose a cover photo before
            publishing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Artwork information */}

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

              <div>
                <label
                  htmlFor="medium"
                  className={labelClass}
                >
                  Medium
                </label>

                <input
                  id="medium"
                  name="medium"
                  type="text"
                  value={medium}
                  onChange={(event) =>
                    setMedium(event.target.value)
                  }
                  placeholder="Installation, Sculpture"
                  className={inputClass}
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
                  placeholder="Ulaanbaatar, Mongolia"
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
                    setDimensions(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                  placeholder="120 × 80 × 40 cm"
                />
              </div>

              <div>
                <label
                  htmlFor="eventName"
                  className={labelClass}
                >
                  Event name
                </label>

                <input
                  id="eventName"
                  name="eventName"
                  type="text"
                  value={eventName}
                  onChange={(event) =>
                    setEventName(
                      event.target.value,
                    )
                  }
                  placeholder="Ulaanbaatar Biennale"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="theme"
                  className={labelClass}
                >
                  Theme
                </label>

                <input
                  id="theme"
                  name="theme"
                  type="text"
                  value={theme}
                  onChange={(event) =>
                    setTheme(event.target.value)
                  }
                  placeholder="Festival or exhibition theme"
                  className={inputClass}
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
                    setDescription(
                      event.target.value,
                    )
                  }
                  className={`${inputClass} min-h-40 resize-y`}
                  placeholder="Artwork description..."
                />
              </div>
            </div>
          </section>

          {/* Media */}

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-950">
                  Media
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Upload images or videos. Images can be
                  selected as the project cover.
                </p>
              </div>

              {media.length > 0 && (
                <p className="text-sm text-neutral-500">
                  {media.length}{' '}
                  {media.length === 1
                    ? 'file'
                    : 'files'}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label
                htmlFor="media"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center transition hover:border-neutral-500 hover:bg-neutral-100"
              >
                <span className="text-sm font-medium text-neutral-900">
                  Choose images or videos
                </span>

                <span className="mt-1 text-xs text-neutral-500">
                  Select one or multiple files
                </span>

                <input
                  id="media"
                  name="media"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled={isUploading}
                  className="sr-only"
                  onChange={(event) => {
                    const files =
                      event.target.files;

                    if (files?.length) {
                      handleMediaUpload(files);
                    }

                    event.target.value = '';
                  }}
                />
              </label>

              {isUploading && (
                <p className="mt-3 text-sm text-neutral-600">
                  Uploading media...
                </p>
              )}
            </div>

            {media.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {media.map((item, index) => {
                  const isCover =
                    item.type === 'image' &&
                    coverUrl === item.url;

                  return (
                    <div
                      key={item.publicId}
                      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={`Artwork image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <video
                            src={item.url}
                            controls
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        )}

                        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium capitalize text-neutral-700">
                          {item.type}
                        </span>

                        {isCover && (
                          <span className="absolute left-3 top-3 rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">
                            Cover
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 p-4">
                        {item.type === 'image' && (
                          <>
                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setCoverUrl(
                                    item.url,
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
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMedia(item)
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

          {/* Publish */}

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
                  Published works can be displayed on
                  the public website.
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
              onClick={handleCancel}
              disabled={
                isUploading ||
                isSubmitting ||
                isCancelling
              }
              className="min-h-12 rounded-xl border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling
                ? 'Cleaning up...'
                : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting || isUploading || isCancelling
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