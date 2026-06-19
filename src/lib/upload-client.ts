/**
 * Client-side helper for uploading images through our /api/upload endpoint.
 * Drop-in replacement for @vercel/blob/client `upload`.
 *
 * Usage:
 *   import { uploadImage } from "@/lib/upload-client";
 *   const url = await uploadImage(file);
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `Upload failed (${res.status})`);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
