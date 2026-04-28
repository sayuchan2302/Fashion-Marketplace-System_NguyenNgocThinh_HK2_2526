import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
} from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ToastType } from '../contexts/ToastContext';
import { resolveImageSearchContext } from '../utils/imageSearchContext';
import { extractImageFileFromClipboard, imageSearchSession } from '../utils/imageSearchSession';
import { validateImageSearchFile } from '../utils/imageSearchValidation';

export interface HeaderImageSearchDraft {
  file: File;
  previewUrl: string;
}

interface UseHeaderImageSearchOptions {
  pathname: string;
  navigate: NavigateFunction;
  closeMobileMenu: () => void;
  closeSearchDropdown: () => void;
  setSearchScope: (scope: 'products') => void;
  addToast: (message: string, type?: ToastType) => void;
}

export const useHeaderImageSearch = ({
  pathname,
  navigate,
  closeMobileMenu,
  closeSearchDropdown,
  setSearchScope,
  addToast,
}: UseHeaderImageSearchOptions) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [isImageSearchModalOpen, setIsImageSearchModalOpen] = useState(false);
  const [imageSearchDraft, setImageSearchDraft] = useState<HeaderImageSearchDraft | null>(null);
  const imageSearchContext = useMemo(() => resolveImageSearchContext(pathname), [pathname]);

  const clearImageSearchDraft = useCallback(() => {
    setImageSearchDraft((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
  }, []);

  const setImageSearchDraftFile = useCallback((file: File) => {
    const validation = validateImageSearchFile(file);
    if (!validation.ok) {
      addToast(validation.message, 'error');
      return false;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageSearchDraft((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return { file, previewUrl };
    });
    return true;
  }, [addToast]);

  const closeImageSearchModal = useCallback(() => {
    setIsImageSearchModalOpen(false);
    clearImageSearchDraft();
  }, [clearImageSearchDraft]);

  const openImageSearchModal = useCallback(() => {
    closeSearchDropdown();
    closeMobileMenu();
    setIsImageSearchModalOpen(true);
  }, [closeMobileMenu, closeSearchDropdown]);

  const triggerImagePicker = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    setImageSearchDraftFile(file);
  }, [setImageSearchDraftFile]);

  const handleModalPaste = useCallback((event: ReactClipboardEvent<HTMLDivElement>) => {
    const file = extractImageFileFromClipboard(event.clipboardData);
    if (!file) {
      return;
    }

    event.preventDefault();
    setImageSearchDraftFile(file);
  }, [setImageSearchDraftFile]);

  const handleImageSearchConfirm = useCallback(() => {
    if (!imageSearchDraft) {
      return;
    }

    imageSearchSession.setPendingFile(imageSearchDraft.file);
    setSearchScope('products');
    closeSearchDropdown();
    setIsImageSearchModalOpen(false);
    clearImageSearchDraft();

    const params = new URLSearchParams();
    params.set('scope', 'products');
    params.set('imageSearch', `${Date.now()}`);
    if (imageSearchContext.categorySlug) {
      params.set('imageCategory', imageSearchContext.categorySlug);
    }
    if (imageSearchContext.storeSlug) {
      params.set('imageStore', imageSearchContext.storeSlug);
    }

    navigate(`/search?${params.toString()}`);
  }, [
    clearImageSearchDraft,
    closeSearchDropdown,
    imageSearchContext.categorySlug,
    imageSearchContext.storeSlug,
    imageSearchDraft,
    navigate,
    setSearchScope,
  ]);

  useEffect(() => {
    if (!isImageSearchModalOpen) {
      document.body.classList.remove('header-image-modal-open');
      return undefined;
    }

    document.body.classList.add('header-image-modal-open');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeImageSearchModal();
      }
    };

    const handlePaste = (event: ClipboardEvent) => {
      const file = extractImageFileFromClipboard(event.clipboardData ?? null);
      if (!file) {
        return;
      }

      event.preventDefault();
      setImageSearchDraftFile(file);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);

    return () => {
      document.body.classList.remove('header-image-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [closeImageSearchModal, isImageSearchModalOpen, setImageSearchDraftFile]);

  useEffect(() => () => {
    document.body.classList.remove('header-image-modal-open');
    clearImageSearchDraft();
  }, [clearImageSearchDraft]);

  return {
    imageInputRef,
    isImageSearchModalOpen,
    imageSearchDraft,
    openImageSearchModal,
    closeImageSearchModal,
    triggerImagePicker,
    handleImageInputChange,
    handleModalPaste,
    handleImageSearchConfirm,
  };
};
