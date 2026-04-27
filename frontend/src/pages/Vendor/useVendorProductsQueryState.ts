import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { normalizePositiveInteger } from './vendorHelpers';
import { normalizeProductTab } from './vendorProducts.constants';

interface UseVendorProductsQueryStateOptions {
  onScopeChange?: () => void;
}

export const useVendorProductsQueryState = ({ onScopeChange }: UseVendorProductsQueryStateOptions = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = normalizeProductTab(searchParams.get('status'));
  const page = normalizePositiveInteger(searchParams.get('page'));
  const keyword = (searchParams.get('q') || '').trim();
  const [searchQuery, setSearchQuery] = useState(keyword);

  const updateQuery = useCallback(
    (mutate: (query: URLSearchParams) => void, replace = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (searchQuery !== keyword) {
      setSearchQuery(keyword);
    }
  }, [keyword, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() === keyword) {
      return;
    }

    const timer = window.setTimeout(() => {
      onScopeChange?.();
      updateQuery((query) => {
        const next = searchQuery.trim();
        if (next) {
          query.set('q', next);
        } else {
          query.delete('q');
        }
        query.set('page', '1');
      }, true);
    }, 260);

    return () => window.clearTimeout(timer);
  }, [keyword, onScopeChange, searchQuery, updateQuery]);

  const handleTabChange = useCallback((key: string) => {
    const nextTab = normalizeProductTab(key);
    onScopeChange?.();
    updateQuery((query) => {
      if (nextTab === 'all') {
        query.delete('status');
      } else {
        query.set('status', nextTab);
      }
      query.set('page', '1');
    });
  }, [onScopeChange, updateQuery]);

  const setPage = useCallback((nextPage: number) => {
    updateQuery((query) => {
      query.set('page', String(Math.max(1, nextPage)));
    });
  }, [updateQuery]);

  const resetCurrentView = useCallback(() => {
    setSearchQuery('');
    onScopeChange?.();
    setSearchParams(new URLSearchParams());
  }, [onScopeChange, setSearchParams]);

  return {
    activeTab,
    page,
    keyword,
    searchQuery,
    setSearchQuery,
    updateQuery,
    handleTabChange,
    setPage,
    resetCurrentView,
  };
};
