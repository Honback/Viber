import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { supabaseStorageBucket, supabaseStorageMaxFileBytes } from "@/lib/env";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_GALLERY_FILES = 5;
const MAX_POST_MEDIA_FILES = 5;

let ensureBucketPromise: Promise<void> | null = null;

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "") || "asset";
}

function sanitizeFilename(value: string) {
  return value
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_가-힣]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "") || "image";
}

function getFileExtension(file: File) {
  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };

  if (file.type in byMime) {
    return byMime[file.type];
  }

  const nameParts = file.name.split(".");
  return nameParts.length > 1 ? nameParts[nameParts.length - 1]!.toLowerCase() : "bin";
}

function isMissingBucketError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("not found") || normalized.includes("does not exist");
}

function arraysEqual(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return leftSorted.every((value, index) => value === rightSorted[index]);
}

async function ensureProjectMediaBucketInternal() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase Storage를 사용하려면 service role key가 필요합니다.");
  }

  const supabase = createSupabaseAdminClient();
  const current = await supabase.storage.getBucket(supabaseStorageBucket);

  if (current.data) {
    const currentMimeTypes = current.data.allowed_mime_types ?? [];
    const currentLimit = current.data.file_size_limit ?? null;
    const needsUpdate =
      current.data.public !== true ||
      currentLimit !== supabaseStorageMaxFileBytes ||
      !arraysEqual(currentMimeTypes, IMAGE_MIME_TYPES);

    if (!needsUpdate) {
      return;
    }

    const updated = await supabase.storage.updateBucket(supabaseStorageBucket, {
      public: true,
      fileSizeLimit: supabaseStorageMaxFileBytes,
      allowedMimeTypes: [...IMAGE_MIME_TYPES]
    });

    if (updated.error) {
      throw new Error(`Storage bucket 설정을 갱신하지 못했습니다: ${updated.error.message}`);
    }

    return;
  }

  if (current.error && !isMissingBucketError(current.error.message)) {
    throw new Error(`Storage bucket 상태를 확인하지 못했습니다: ${current.error.message}`);
  }

  const created = await supabase.storage.createBucket(supabaseStorageBucket, {
    public: true,
    fileSizeLimit: supabaseStorageMaxFileBytes,
    allowedMimeTypes: [...IMAGE_MIME_TYPES]
  });

  if (created.error && !created.error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Storage bucket을 만들지 못했습니다: ${created.error.message}`);
  }
}

export async function ensureProjectMediaBucket() {
  if (!ensureBucketPromise) {
    ensureBucketPromise = ensureProjectMediaBucketInternal().catch((error) => {
      ensureBucketPromise = null;
      throw error;
    });
  }

  await ensureBucketPromise;
}

function assertImageFile(file: File, label: string) {
  if (!file.size) {
    throw new Error(`${label} 파일이 비어 있습니다.`);
  }

  if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
    throw new Error(`${label} 파일 형식은 JPG, PNG, WEBP, GIF만 허용됩니다.`);
  }

  if (file.size > supabaseStorageMaxFileBytes) {
    throw new Error(`${label} 파일은 ${(supabaseStorageMaxFileBytes / 1024 / 1024).toFixed(0)}MB 이하만 업로드할 수 있습니다.`);
  }
}

async function uploadImageFile(file: File, input: { scopeKey: string; slot: "cover" | "gallery" | "post" }) {
  assertImageFile(file, input.slot === "cover" ? "대표 이미지" : input.slot === "gallery" ? "갤러리 이미지" : "첨부 이미지");
  await ensureProjectMediaBucket();

  const supabase = createSupabaseAdminClient();
  const extension = getFileExtension(file);
  const path = `projects/${sanitizeSegment(input.scopeKey)}/${input.slot}/${Date.now()}-${randomUUID()}-${sanitizeFilename(file.name)}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploaded = await supabase.storage.from(supabaseStorageBucket).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false
  });

  if (uploaded.error) {
    throw new Error(`이미지 업로드에 실패했습니다: ${uploaded.error.message}`);
  }

  const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(uploaded.data.path);
  return {
    path: uploaded.data.path,
    publicUrl: data.publicUrl
  };
}

export function getSingleFile(formData: FormData, name: string) {
  const entry = formData.get(name);
  return entry instanceof File && entry.size > 0 ? entry : null;
}

export function getMultipleFiles(formData: FormData, name: string) {
  return formData.getAll(name).filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function uploadProjectImageSet(input: {
  scopeKey: string;
  coverFile?: File | null;
  galleryFiles?: File[];
}) {
  const galleryFiles = input.galleryFiles ?? [];

  if (galleryFiles.length > MAX_GALLERY_FILES) {
    throw new Error(`갤러리 이미지는 최대 ${MAX_GALLERY_FILES}개까지 업로드할 수 있습니다.`);
  }

  const cover = input.coverFile ? await uploadImageFile(input.coverFile, { scopeKey: input.scopeKey, slot: "cover" }) : null;
  const gallery = await Promise.all(
    galleryFiles.map((file) => uploadImageFile(file, { scopeKey: input.scopeKey, slot: "gallery" }))
  );

  return {
    coverImageUrl: cover?.publicUrl ?? null,
    galleryUrls: gallery.map((item) => item.publicUrl)
  };
}

export async function uploadProjectPostMedia(input: {
  scopeKey: string;
  files?: File[];
}) {
  const files = input.files ?? [];

  if (files.length > MAX_POST_MEDIA_FILES) {
    throw new Error(`활동 첨부 이미지는 최대 ${MAX_POST_MEDIA_FILES}개까지 업로드할 수 있습니다.`);
  }

  const uploaded = await Promise.all(files.map((file) => uploadImageFile(file, { scopeKey: input.scopeKey, slot: "post" })));

  return uploaded.map((item) => item.publicUrl);
}

export const projectMediaAccept = IMAGE_MIME_TYPES.join(",");
export const projectMediaMaxFileSizeLabel = `${(supabaseStorageMaxFileBytes / 1024 / 1024).toFixed(0)}MB`;
