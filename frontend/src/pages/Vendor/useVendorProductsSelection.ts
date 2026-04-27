import { useCallback, useState } from 'react';

export const useVendorProductsSelection = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const toggleSelectAll = useCallback((checked: boolean, visibleIds: string[]) => {
    if (checked) {
      setSelected(new Set(visibleIds));
      return;
    }
    setSelected(new Set());
  }, []);

  const toggleOne = useCallback((id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const pruneToVisibleIds = useCallback((ids: string[]) => {
    setSelected((current) => {
      const visible = new Set(ids);
      return new Set(Array.from(current).filter((id) => visible.has(id)));
    });
  }, []);

  return {
    selected,
    setSelected,
    clearSelection,
    toggleSelectAll,
    toggleOne,
    pruneToVisibleIds,
  };
};
