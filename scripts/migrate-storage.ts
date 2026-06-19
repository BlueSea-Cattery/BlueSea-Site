#!/usr/bin/env tsx
/**
 * scripts/migrate-storage.ts
 *
 * One-time migration: Vercel Blob → S3-compatible storage
 *
 * What it does:
 *   1. Reads all files from Vercel Blob (via HTTP API, no extra package needed)
 *   2. Downloads each file and re-uploads it to S3 preserving the original path
 *   3. Updates every URL reference in the PostgreSQL database via Prisma
 *
 * Usage:
 *   npx tsx scripts/migrate-storage.ts          # live run
 *   npx tsx scripts/migrate-storage.ts --dry-run # preview only, no writes
 *
 * Required env vars (loaded from .env and .env.local):
 *   BLOB_READ_WRITE_TOKEN   — Vercel Blob token
 *   DATABASE_URL            — PostgreSQL connection string
 *   S3_ENDPOINT             — e.g. https://s3.your-domain.ru
 *   S3_REGION               — e.g. us-east-1
 *   S3_ACCESS_KEY
 *   S3_SECRET_KEY
 *   S3_BUCKET_NAME
 */

import * as dotenv from "dotenv";
// Mirror Next.js env loading: .env first, .env.local overrides
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BlobItem {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  contentType?: string;
  contentDisposition?: string;
}

interface BlobListResponse {
  blobs: BlobItem[];
  cursor?: string;
  hasMore: boolean;
}

interface MigrateResult {
  ok: boolean;
  blob: BlobItem;
  newUrl?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config validation
// ─────────────────────────────────────────────────────────────────────────────

function validateConfig() {
  const vars = {
    BLOB_READ_WRITE_TOKEN : process.env.BLOB_READ_WRITE_TOKEN,
    DATABASE_URL          : process.env.DATABASE_URL,
    S3_ENDPOINT           : process.env.S3_ENDPOINT,
    S3_ACCESS_KEY         : process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY         : process.env.S3_SECRET_KEY,
    S3_BUCKET_NAME        : process.env.S3_BUCKET_NAME,
  } as const;

  const missing = (Object.entries(vars) as [string, string | undefined][])
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${
        missing.map((k) => `  - ${k}`).join("\n")
      }\n\nMake sure these are set in .env or .env.local`
    );
  }

  return vars as Record<keyof typeof vars, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: visual progress
// ─────────────────────────────────────────────────────────────────────────────

/** Returns a fixed-width progress prefix like "[  3/100]" */
function progress(current: number, total: number): string {
  const w = String(total).length;
  return `[${String(current).padStart(w)}/${total}]`;
}

/** Human-readable file size */
function humanSize(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: List all blobs from Vercel Blob HTTP API (handles pagination)
// ─────────────────────────────────────────────────────────────────────────────

async function listAllBlobs(token: string): Promise<BlobItem[]> {
  const allBlobs: BlobItem[] = [];
  let cursor: string | undefined;
  let page = 0;

  do {
    page++;
    const params = new URLSearchParams({ limit: "1000", mode: "expanded" });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`https://blob.vercel-storage.com/?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Vercel Blob list failed (HTTP ${res.status}): ${body}`);
    }

    const data = (await res.json()) as BlobListResponse;
    allBlobs.push(...data.blobs);
    cursor = data.cursor;

    if (data.hasMore) {
      console.log(`   Page ${page}: ${data.blobs.length} files — continuing...`);
    }
  } while (cursor);

  return allBlobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2a: Download a single blob into a Buffer
// ─────────────────────────────────────────────────────────────────────────────

async function downloadBlob(blob: BlobItem): Promise<Buffer> {
  // Prefer downloadUrl (bypasses CDN, more reliable for large files)
  const fetchUrl = blob.downloadUrl || blob.url;
  const res = await fetch(fetchUrl);
  if (!res.ok) {
    throw new Error(`Download failed (HTTP ${res.status}) for ${fetchUrl}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2b: Detect content-type from pathname if not provided
// ─────────────────────────────────────────────────────────────────────────────

const EXT_TO_MIME: Record<string, string> = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".pdf":  "application/pdf",
};

function resolveContentType(blob: BlobItem): string {
  if (blob.contentType && blob.contentType !== "application/octet-stream") {
    return blob.contentType;
  }
  const ext = path.extname(blob.pathname).toLowerCase();
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2c: Upload buffer to S3
// ─────────────────────────────────────────────────────────────────────────────

async function uploadToS3(
  s3: S3Client,
  bucket: string,
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Remove ACL line if your S3 provider doesn't support it (e.g. Cloudflare R2).
      // Use a bucket policy for public read access instead.
      ACL: "public-read",
    })
  );

  const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, "");
  return `${endpoint}/${bucket}/${key}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Update all URL references in the database
//
// Tables & fields that contain image URLs:
//   Cat         — photoUrl (String?),  photos (String[])
//   Kitten      — photoUrl (String?),  photos (String[])
//   GalleryImage — url (String)
//   Achievement  — url (String)
//   Pedigree     — photoUrl (String)
//   SiteContent  — value (String)  ← contains image URLs for hero_bg etc.
// ─────────────────────────────────────────────────────────────────────────────

type DbUpdateStats = {
  recordsChecked: number;
  recordsUpdated: number;
  errors: string[];
};

function replaceUrl(value: string | null, urlMap: Map<string, string>): string | null {
  if (!value) return value;
  return urlMap.get(value) ?? value;
}

function replaceUrlInArray(arr: string[], urlMap: Map<string, string>): string[] {
  return arr.map((v) => urlMap.get(v) ?? v);
}

function arrayNeedsUpdate(arr: string[], urlMap: Map<string, string>): boolean {
  return arr.some((v) => urlMap.has(v));
}

async function updateDatabase(
  prisma: PrismaClient,
  urlMap: Map<string, string>,
  dryRun: boolean
): Promise<DbUpdateStats> {
  const stats: DbUpdateStats = { recordsChecked: 0, recordsUpdated: 0, errors: [] };

  // ── Cat ──────────────────────────────────────────────────────────────────
  try {
    const cats = await prisma.cat.findMany();
    stats.recordsChecked += cats.length;

    for (const cat of cats) {
      const newPhotoUrl = replaceUrl(cat.photoUrl, urlMap);
      const newPhotos   = replaceUrlInArray(cat.photos, urlMap);
      const changed = newPhotoUrl !== cat.photoUrl || arrayNeedsUpdate(cat.photos, urlMap);

      if (changed) {
        console.log(`     Cat "${cat.name}" (${cat.id})`);
        if (cat.photoUrl && newPhotoUrl !== cat.photoUrl)
          console.log(`       photoUrl: ${cat.photoUrl} → ${newPhotoUrl}`);
        const changedPhotos = cat.photos.filter((_, i) => newPhotos[i] !== cat.photos[i]);
        if (changedPhotos.length) console.log(`       photos[]: ${changedPhotos.length} URL(s) replaced`);

        if (!dryRun) {
          await prisma.cat.update({
            where: { id: cat.id },
            data: { photoUrl: newPhotoUrl, photos: newPhotos },
          });
        }
        stats.recordsUpdated++;
      }
    }
  } catch (e) {
    stats.errors.push(`Cat table: ${String(e)}`);
  }

  // ── Kitten ───────────────────────────────────────────────────────────────
  try {
    const kittens = await prisma.kitten.findMany();
    stats.recordsChecked += kittens.length;

    for (const kitten of kittens) {
      const newPhotoUrl = replaceUrl(kitten.photoUrl, urlMap);
      const newPhotos   = replaceUrlInArray(kitten.photos, urlMap);
      const changed = newPhotoUrl !== kitten.photoUrl || arrayNeedsUpdate(kitten.photos, urlMap);

      if (changed) {
        console.log(`     Kitten "${kitten.name}" (${kitten.id})`);
        if (kitten.photoUrl && newPhotoUrl !== kitten.photoUrl)
          console.log(`       photoUrl: ${kitten.photoUrl} → ${newPhotoUrl}`);
        const changedPhotos = kitten.photos.filter((_, i) => newPhotos[i] !== kitten.photos[i]);
        if (changedPhotos.length) console.log(`       photos[]: ${changedPhotos.length} URL(s) replaced`);

        if (!dryRun) {
          await prisma.kitten.update({
            where: { id: kitten.id },
            data: { photoUrl: newPhotoUrl, photos: newPhotos },
          });
        }
        stats.recordsUpdated++;
      }
    }
  } catch (e) {
    stats.errors.push(`Kitten table: ${String(e)}`);
  }

  // ── GalleryImage ─────────────────────────────────────────────────────────
  try {
    const images = await prisma.galleryImage.findMany();
    stats.recordsChecked += images.length;

    for (const img of images) {
      const newUrl = urlMap.get(img.url);
      if (newUrl) {
        console.log(`     GalleryImage (${img.id}): ${img.url} → ${newUrl}`);
        if (!dryRun) {
          await prisma.galleryImage.update({ where: { id: img.id }, data: { url: newUrl } });
        }
        stats.recordsUpdated++;
      }
    }
  } catch (e) {
    stats.errors.push(`GalleryImage table: ${String(e)}`);
  }

  // ── Achievement ──────────────────────────────────────────────────────────
  try {
    const achievements = await prisma.achievement.findMany();
    stats.recordsChecked += achievements.length;

    for (const ach of achievements) {
      const newUrl = urlMap.get(ach.url);
      if (newUrl) {
        console.log(`     Achievement (${ach.id}): ${ach.url} → ${newUrl}`);
        if (!dryRun) {
          await prisma.achievement.update({ where: { id: ach.id }, data: { url: newUrl } });
        }
        stats.recordsUpdated++;
      }
    }
  } catch (e) {
    stats.errors.push(`Achievement table: ${String(e)}`);
  }

  // ── Pedigree ─────────────────────────────────────────────────────────────
  try {
    const pedigrees = await prisma.pedigree.findMany();
    stats.recordsChecked += pedigrees.length;

    for (const ped of pedigrees) {
      const newUrl = urlMap.get(ped.photoUrl);
      if (newUrl) {
        console.log(`     Pedigree "${ped.name}" (${ped.id}): ${ped.photoUrl} → ${newUrl}`);
        if (!dryRun) {
          await prisma.pedigree.update({ where: { id: ped.id }, data: { photoUrl: newUrl } });
        }
        stats.recordsUpdated++;
      }
    }
  } catch (e) {
    stats.errors.push(`Pedigree table: ${String(e)}`);
  }

  // ── SiteContent ──────────────────────────────────────────────────────────
  try {
    const contents = await prisma.siteContent.findMany();
    stats.recordsChecked += contents.length;

    for (const entry of contents) {
      const newValue = urlMap.get(entry.value);
      if (newValue) {
        console.log(`     SiteContent key="${entry.key}": ${entry.value} → ${newValue}`);
        if (!dryRun) {
          await prisma.siteContent.update({ where: { id: entry.id }, data: { value: newValue } });
        }
        stats.recordsUpdated++;
      }
    }
  } catch (e) {
    stats.errors.push(`SiteContent table: ${String(e)}`);
  }

  return stats;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const SEP = "─".repeat(60);
  console.log(SEP);
  console.log(" Vercel Blob → S3 Storage Migration");
  if (dryRun) console.log(" ⚠️  DRY-RUN MODE — no files will be written");
  console.log(SEP + "\n");

  // ── Validate env ──────────────────────────────────────────────────────────
  let config: ReturnType<typeof validateConfig>;
  try {
    config = validateConfig();
  } catch (e) {
    console.error("❌", String(e));
    process.exit(1);
  }

  // ── Prisma client ─────────────────────────────────────────────────────────
  const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });
  const prisma  = new PrismaClient({ adapter });

  // ── S3 client ─────────────────────────────────────────────────────────────
  const s3 = new S3Client({
    endpoint   : config.S3_ENDPOINT,
    region     : process.env.S3_REGION ?? "us-east-1",
    credentials: { accessKeyId: config.S3_ACCESS_KEY, secretAccessKey: config.S3_SECRET_KEY },
    forcePathStyle: true,
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 1 — List all files in Vercel Blob
  // ──────────────────────────────────────────────────────────────────────────
  console.log("📋 Phase 1: Listing files in Vercel Blob...");
  let blobs: BlobItem[];
  try {
    blobs = await listAllBlobs(config.BLOB_READ_WRITE_TOKEN);
  } catch (e) {
    console.error("❌ Failed to list blobs:", String(e));
    await prisma.$disconnect();
    process.exit(1);
  }

  if (blobs.length === 0) {
    console.log("   Vercel Blob is empty. Nothing to migrate. ✅");
    await prisma.$disconnect();
    return;
  }

  const totalSize = blobs.reduce((acc, b) => acc + b.size, 0);
  console.log(`   Found ${blobs.length} file(s) — total ${humanSize(totalSize)}\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 2 — Download from Vercel Blob, upload to S3
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`📦 Phase 2: Migrating files to S3 (${config.S3_ENDPOINT})...\n`);

  /** Maps old Vercel Blob URL → new S3 URL */
  const urlMap = new Map<string, string>();
  const fileErrors: Array<{ blob: BlobItem; error: string }> = [];
  let successCount = 0;

  for (let i = 0; i < blobs.length; i++) {
    const blob    = blobs[i]!;
    const prefix  = progress(i + 1, blobs.length);
    const sizeStr = humanSize(blob.size);

    process.stdout.write(`${prefix} ${blob.pathname} (${sizeStr}) ... `);

    if (dryRun) {
      // In dry-run: just build the expected new URL without downloading/uploading
      const endpoint = config.S3_ENDPOINT.replace(/\/$/, "");
      const newUrl   = `${endpoint}/${config.S3_BUCKET_NAME}/${blob.pathname}`;
      urlMap.set(blob.url, newUrl);
      console.log("SKIP (dry-run)");
      successCount++;
      continue;
    }

    try {
      // Download
      const buffer      = await downloadBlob(blob);
      const contentType = resolveContentType(blob);

      // Upload to S3
      const newUrl = await uploadToS3(
        s3,
        config.S3_BUCKET_NAME,
        blob.pathname,
        buffer,
        contentType
      );

      urlMap.set(blob.url, newUrl);
      // Also register downloadUrl variant if different (Vercel sometimes stores both)
      if (blob.downloadUrl && blob.downloadUrl !== blob.url) {
        urlMap.set(blob.downloadUrl, newUrl);
      }

      console.log(`✓  →  ${newUrl}`);
      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`✗  ERROR: ${message}`);
      fileErrors.push({ blob, error: message });
      // Do NOT stop — continue with remaining files
    }
  }

  console.log(`\n   Transferred: ${successCount}/${blobs.length} file(s)`);
  if (fileErrors.length > 0) {
    console.log(`   Failed:      ${fileErrors.length} file(s) (see summary below)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3 — Update database references
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`\n🗄️  Phase 3: Updating database references${dryRun ? " (dry-run)" : ""}...\n`);

  let dbStats: DbUpdateStats;
  try {
    dbStats = await updateDatabase(prisma, urlMap, dryRun);
  } catch (e) {
    console.error("❌ Unexpected database error:", String(e));
    dbStats = { recordsChecked: 0, recordsUpdated: 0, errors: [String(e)] };
  } finally {
    await prisma.$disconnect();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`\n${SEP}`);
  console.log(` Summary${dryRun ? " (DRY-RUN — nothing was written)" : ""}`);
  console.log(SEP);
  console.log(` Files found in Vercel Blob : ${blobs.length}`);
  console.log(` Files migrated to S3       : ${successCount}`);
  console.log(` Files failed               : ${fileErrors.length}`);
  console.log(` DB records checked         : ${dbStats.recordsChecked}`);
  console.log(` DB records updated         : ${dbStats.recordsUpdated}${dryRun ? " (would update)" : ""}`);

  if (fileErrors.length > 0) {
    console.log(`\n❌ Files that could not be migrated (URLs in DB were NOT updated):`);
    fileErrors.forEach(({ blob, error }) => {
      console.log(`   - ${blob.pathname}`);
      console.log(`     Reason: ${error}`);
    });
  }

  if (dbStats.errors.length > 0) {
    console.log(`\n⚠️  Database errors:`);
    dbStats.errors.forEach((e) => console.log(`   - ${e}`));
  }

  const allOk = fileErrors.length === 0 && dbStats.errors.length === 0;
  console.log(`\n${allOk ? "✅ Migration completed successfully!" : "⚠️  Migration completed with errors. Review the output above."}`);
  console.log(SEP + "\n");

  if (!allOk) process.exit(1);
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err instanceof Error ? err.message : String(err));
  if (err instanceof Error && err.stack) console.error(err.stack);
  process.exit(1);
});
