/**
 * Composable for uploading media files to MinIO via /api/v1/media/upload.
 * Supports images, videos, audio, and binary (.splat) files up to 100MB.
 */
export function useMediaUpload() {
  const uploading = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);

  interface UploadResult {
    object_name: string;
    bucket: string;
    size: number;
    url: string;
  }

  async function upload(file: File): Promise<UploadResult | null> {
    uploading.value = true;
    progress.value = 0;
    error.value = null;

    // Client-side validation
    const MAX_SIZE = 104_857_600; // 100 MB
    if (file.size > MAX_SIZE) {
      error.value = `Файл слишком большой: ${(file.size / 1024 / 1024).toFixed(1)} МБ (макс. 100 МБ)`;
      uploading.value = false;
      return null;
    }

    const ALLOWED_MIMES = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm", "video/quicktime",
      "audio/mpeg", "audio/mp3", "audio/ogg", "audio/webm", "audio/wav",
      "application/octet-stream",
    ];

    if (!ALLOWED_MIMES.includes(file.type) && file.type !== "") {
      error.value = `Неподдерживаемый тип файла: ${file.type}`;
      uploading.value = false;
      return null;
    }

    try {
      const { request } = useApiClient();
      const formData = new FormData();
      formData.append("file", file);

      progress.value = 50; // Indicate upload in progress

      const response = await request<{
        success: boolean;
        message: string;
        data: UploadResult;
      }>("/api/v1/media/upload", {
        method: "POST",
        body: formData as unknown as Record<string, unknown>,
      });

      progress.value = 100;

      if (response.success && response.data) {
        return response.data;
      }

      error.value = response.message || "Ошибка загрузки файла";
      return null;
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      error.value = apiErr.message || "Ошибка загрузки файла";
      return null;
    } finally {
      uploading.value = false;
    }
  }

  /**
   * Upload multiple files sequentially.
   */
  async function uploadMultiple(files: File[]): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    for (const file of files) {
      const result = await upload(file);
      if (result) results.push(result);
    }
    return results;
  }

  return {
    upload,
    uploadMultiple,
    uploading: readonly(uploading),
    progress: readonly(progress),
    error: readonly(error),
  };
}
