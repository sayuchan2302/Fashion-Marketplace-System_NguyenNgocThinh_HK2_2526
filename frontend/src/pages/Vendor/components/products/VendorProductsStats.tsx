import { PanelStatsGrid } from '../../../../components/Panel/PanelPrimitives';
import type { ProductTab, VendorProductStatusCounts } from '../../vendorProducts.types';

interface VendorProductsStatsProps {
  statusCounts: VendorProductStatusCounts;
  onTabChange: (tab: ProductTab) => void;
}

const VendorProductsStats = ({ statusCounts, onTabChange }: VendorProductsStatsProps) => (
  <PanelStatsGrid
    accentClassName="vendor-stat-button"
    items={[
      { key: 'all', label: 'Tổng SKU', value: statusCounts.all, sub: 'Toàn bộ danh mục của shop', onClick: () => onTabChange('all') },
      { key: 'active', label: 'Đang bán', value: statusCounts.active, sub: 'SKU đang hiển thị trên sàn', tone: 'success', onClick: () => onTabChange('active') },
      { key: 'stock', label: 'Sắp hết / hết hàng', value: statusCounts.outOfStock + statusCounts.lowStock, sub: 'Cần bổ sung tồn kho', tone: 'warning', onClick: () => onTabChange('outOfStock') },
      { key: 'draft', label: 'Ẩn / nháp', value: statusCounts.draft, sub: 'SKU chưa mở bán công khai', tone: 'info', onClick: () => onTabChange('draft') },
    ]}
  />
);

export default VendorProductsStats;
