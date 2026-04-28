let pendingImageSearchFile: File | null = null;
const clearPendingImageSearchFile = () => {
  pendingImageSearchFile = null;
};

export const extractImageFileFromClipboard = (clipboardData: DataTransfer | null): File | null => {
  if (!clipboardData) {
    return null;
  }

  const items = Array.from(clipboardData.items || []);
  for (const item of items) {
    if (!item.type.toLowerCase().startsWith('image/')) {
      continue;
    }

    const file = item.getAsFile();
    if (file) {
      return file;
    }
  }

  return null;
};

export const imageSearchSession = {
  setPendingFile(file: File) {
    pendingImageSearchFile = file;
  },
  hasPendingFile() {
    return pendingImageSearchFile !== null;
  },
  clearPendingFile() {
    clearPendingImageSearchFile();
  },
  consumePendingFile() {
    const file = pendingImageSearchFile;
    clearPendingImageSearchFile();
    return file;
  },
};
