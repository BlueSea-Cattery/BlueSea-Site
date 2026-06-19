/**
 * Storage URL helper.
 * Previously proxied Vercel Blob URLs through /storage/*.
 * Now simply returns the URL as-is: files are served directly from
 * our S3-compatible storage (MinIO / Yandex Object Storage / VK Cloud, etc.).
 */
export function getProxiedUrl(url: string | null | undefined): string {
  return url ?? '';
}
