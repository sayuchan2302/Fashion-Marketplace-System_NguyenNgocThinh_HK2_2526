import { AdminStateBlock, AdminTableSkeleton } from '../../../Admin/AdminStateBlocks';
import { PanelTableFooter } from '../../../../components/Panel/PanelPrimitives';
import type { VendorProductRecord } from '../../../../services/vendorProductService';
import VendorProductsRow from './VendorProductsRow';

interface VendorProductsTableProps {
  loading: boolean;
  loadError: string;
  keyword: string;
  products: VendorProductRecord[];
  allSelected: boolean;
  working: boolean;
  startIndex: number;
  endIndex: number;
  totalElements: number;
  page: number;
  totalPages: number;
  onReload: () => void;
  onResetCurrentView: () => void;
  onOpenCreateProductDrawer: () => void;
  onToggleSelectAll: (checked: boolean) => void;
  isSelected: (id: string) => boolean;
  onToggleOne: (id: string, checked: boolean) => void;
  onOpenEditDrawer: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onRequestDelete: (ids: string[]) => void;
  onPageChange: (page: number) => void;
}

const VendorProductsTable = ({
  loading,
  loadError,
  keyword,
  products,
  allSelected,
  working,
  startIndex,
  endIndex,
  totalElements,
  page,
  totalPages,
  onReload,
  onResetCurrentView,
  onOpenCreateProductDrawer,
  onToggleSelectAll,
  isSelected,
  onToggleOne,
  onOpenEditDrawer,
  onToggleVisibility,
  onRequestDelete,
  onPageChange,
}: VendorProductsTableProps) => {
  if (loading) {
    return <AdminTableSkeleton columns={8} rows={6} />;
  }

  if (loadError) {
    return (
      <AdminStateBlock
        type="error"
        title="Không tải được dữ liệu sản phẩm"
        description={loadError}
        actionLabel="Tải lại"
        onAction={onReload}
      />
    );
  }

  if (products.length === 0) {
    return (
      <AdminStateBlock
        type={keyword ? 'search-empty' : 'empty'}
        title={keyword ? 'Không tìm thấy SKU phù hợp' : 'Chưa có sản phẩm nào'}
        description={keyword ? 'Thử đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.' : 'Khi shop tạo sản phẩm mới, danh sách sẽ xuất hiện tại đây.'}
        actionLabel={keyword ? 'Đặt lại bộ lọc' : 'Thêm sản phẩm'}
        onAction={keyword ? onResetCurrentView : onOpenCreateProductDrawer}
      />
    );
  }

  return (
    <>
      <div className="admin-table" role="table" aria-label="Bảng sản phẩm của gian hàng">
        <div className="admin-table-row vendor-products admin-table-head" role="row">
          <div role="columnheader">
            <input type="checkbox" aria-label="Chọn tất cả sản phẩm" checked={allSelected} onChange={(event) => onToggleSelectAll(event.target.checked)} />
          </div>
          <div role="columnheader">STT</div>
          <div role="columnheader">Sản phẩm</div>
          <div role="columnheader">Danh mục</div>
          <div role="columnheader">Giá bán</div>
          <div role="columnheader">Tồn kho</div>
          <div role="columnheader">Đã bán</div>
          <div role="columnheader">Trạng thái</div>
          <div role="columnheader">Hành động</div>
        </div>

        {products.map((product, index) => (
          <VendorProductsRow
            key={product.id}
            product={product}
            index={index}
            rowNumber={startIndex + index}
            checked={isSelected(product.id)}
            working={working}
            onToggle={(checked) => onToggleOne(product.id, checked)}
            onOpenEdit={() => onOpenEditDrawer(product.id)}
            onToggleVisibility={() => onToggleVisibility(product.id, !product.visible)}
            onDelete={() => onRequestDelete([product.id])}
          />
        ))}
      </div>

      <PanelTableFooter
        meta={`Hiển thị ${startIndex}-${endIndex} trên ${totalElements} sản phẩm`}
        page={page}
        totalPages={Math.max(totalPages, 1)}
        onPageChange={onPageChange}
        activePageClassName="vendor-active-page"
        nextLabel="Sau"
      />
    </>
  );
};

export default VendorProductsTable;
