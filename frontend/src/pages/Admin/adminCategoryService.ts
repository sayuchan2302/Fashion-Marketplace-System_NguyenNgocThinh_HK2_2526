import { apiRequest } from '../../services/apiClient';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string;
  order: number;
  depth: number;
  childrenCount: number;
  description: string;
  image: string;
}

interface BackendCategoryTreeNode {
  id: string;
  name?: string;
  slug?: string;
  sortOrder?: number;
  children?: BackendCategoryTreeNode[];
}

interface BackendCategoryFlat {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}

interface CategoryMutationInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder: number;
}

const normalizeText = (value?: string) => (value || '').trim();

const toCategoryRows = (tree: BackendCategoryTreeNode[]): AdminCategory[] => {
  const rows: AdminCategory[] = [];

  const visit = (node: BackendCategoryTreeNode, parentId: string, depth: number) => {
    const children = node.children || [];
    rows.push({
      id: node.id,
      name: normalizeText(node.name) || 'Danh muc',
      slug: normalizeText(node.slug),
      parentId,
      order: Number(node.sortOrder || 0),
      depth,
      childrenCount: children.length,
      description: '',
      image: '',
    });
    children.forEach((child) => visit(child, node.id, depth + 1));
  };

  tree.forEach((root) => visit(root, '', 1));
  return rows;
};

const mergeDetails = (treeRows: AdminCategory[], details: BackendCategoryFlat[]) => {
  const byId = new Map(details.map((detail) => [detail.id, detail]));
  return treeRows.map((row) => {
    const detail = byId.get(row.id);
    return {
      ...row,
      name: normalizeText(detail?.name) || row.name,
      slug: normalizeText(detail?.slug) || row.slug,
      order: Number(detail?.sortOrder ?? row.order),
      description: normalizeText(detail?.description),
      image: normalizeText(detail?.image),
    };
  });
};

const sortRows = (rows: AdminCategory[]) =>
  [...rows].sort((left, right) => {
    if (left.parentId !== right.parentId) {
      return left.parentId.localeCompare(right.parentId);
    }
    if (left.order !== right.order) {
      return left.order - right.order;
    }
    return left.name.localeCompare(right.name, 'vi');
  });

const toMutationPayload = (input: CategoryMutationInput) => ({
  name: normalizeText(input.name),
  slug: normalizeText(input.slug),
  description: normalizeText(input.description),
  image: normalizeText(input.image),
  parentId: normalizeText(input.parentId) || null,
  sortOrder: Math.max(0, Number(input.sortOrder || 0)),
});

export const adminCategoryService = {
  async getCategories(): Promise<AdminCategory[]> {
    const [tree, details] = await Promise.all([
      apiRequest<BackendCategoryTreeNode[]>('/api/categories/tree', {}, { auth: true }),
      apiRequest<BackendCategoryFlat[]>('/api/categories', {}, { auth: true }),
    ]);

    const merged = mergeDetails(toCategoryRows(tree || []), details || []);
    return sortRows(merged);
  },

  async createCategory(input: CategoryMutationInput) {
    await apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify(toMutationPayload(input)),
    }, { auth: true });
  },

  async updateCategory(id: string, input: CategoryMutationInput) {
    await apiRequest(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toMutationPayload(input)),
    }, { auth: true });
  },

  async deleteCategory(id: string) {
    await apiRequest(`/api/categories/${id}`, {
      method: 'DELETE',
    }, { auth: true });
  },
};
