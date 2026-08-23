"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWorkPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [place, setPlace] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(createSlug(value));
  }

  async function handleImageUpload(file: File) {
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3001/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = await response.json();

      setImageUrl(data.imageUrl);
    } catch (err) {
      console.error(err);
      setError("Image could not be uploaded.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/works", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          place: place || undefined,
          year: year ? Number(year) : undefined,
          isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create work");
      }

      router.push("/works");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Work could not be added.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Add New Work</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="place">Place / Exhibition</label>
          <input
            id="place"
            name="place"
            type="text"
            value={place}
            onChange={(event) => setPlace(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="year">Year</label>
          <input
            id="year"
            name="year"
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="image">Image</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                handleImageUpload(file);
              }
            }}
          />

          {isUploading && <p>Uploading image...</p>}

          {imageUrl && (
            <div>
              <p>Image uploaded successfully.</p>

              <img src={imageUrl} alt="Uploaded artwork preview" width={300} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="isPublished">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
            />
            Published
          </label>
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Adding..." : "Add Work"}
        </button>
      </form>
    </main>
  );
}
