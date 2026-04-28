export interface ImageSearchContext {
  categorySlug: string;
  storeSlug: string;
}

const decodePathSegment = (value: string): string => {
  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
};

export const resolveImageSearchContext = (pathname: string): ImageSearchContext => {
  const categoryMatch = pathname.match(/^\/category\/([^/?#]+)/i);
  if (categoryMatch?.[1]) {
    const categorySlug = decodePathSegment(categoryMatch[1]);
    if (categorySlug && categorySlug !== 'all' && categorySlug !== 'sale' && categorySlug !== 'new') {
      return { categorySlug, storeSlug: '' };
    }

    return { categorySlug: '', storeSlug: '' };
  }

  const storeMatch = pathname.match(/^\/store\/([^/?#]+)/i);
  if (storeMatch?.[1]) {
    return {
      categorySlug: '',
      storeSlug: decodePathSegment(storeMatch[1]),
    };
  }

  return { categorySlug: '', storeSlug: '' };
};
