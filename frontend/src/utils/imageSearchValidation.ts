const IMAGE_SEARCH_MAX_FILE_SIZE_BYTES = 5_242_880;
const IMAGE_SEARCH_MAX_FILE_SIZE_MB = Math.round(IMAGE_SEARCH_MAX_FILE_SIZE_BYTES / 1024 / 1024);

type ImageSearchValidationResult =
  | { ok: true }
  | { ok: false; message: string };

const isImageMimeType = (value: string) => value.trim().toLowerCase().startsWith('image/');

export const validateImageSearchFile = (
  file: File | null | undefined,
): ImageSearchValidationResult => {
  if (!file) {
    return { ok: false, message: 'Vui lòng chọn hình ảnh để tìm kiếm.' };
  }

  if (!isImageMimeType(file.type || '')) {
    return { ok: false, message: 'Chỉ chấp nhận file hình ảnh.' };
  }

  if (file.size > IMAGE_SEARCH_MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: `Hình ảnh vượt quá ${IMAGE_SEARCH_MAX_FILE_SIZE_MB} MB. Vui lòng chọn ảnh nhỏ hơn.`,
    };
  }

  return { ok: true };
};

export { IMAGE_SEARCH_MAX_FILE_SIZE_BYTES };
