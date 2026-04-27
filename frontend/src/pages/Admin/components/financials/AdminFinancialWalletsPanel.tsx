import { motion } from 'framer-motion';
import { CheckCircle2, Eye } from 'lucide-react';
import { AdminStateBlock } from '../../AdminStateBlocks';
import type { VendorWallet } from '../../../../services/walletService';
import { PAGE_SIZE, formatCurrency, toStoreRef } from './adminFinancialPresentation';

type Props = {
  isLoading: boolean;
  records: VendorWallet[];
  search: string;
  selected: Set<string>;
  page: number;
  totalPages: number;
  onSelectionChange: (next: Set<string>) => void;
  onPageChange: (page: number) => void;
  onResetCurrentView: () => void;
  onOpenDetail: (record: VendorWallet) => void;
  onOpenReleaseConfirm: (storeIds: string[]) => void;
};

const AdminFinancialWalletsPanel = ({
  isLoading,
  records,
  search,
  selected,
  page,
  totalPages,
  onSelectionChange,
  onPageChange,
  onResetCurrentView,
  onOpenDetail,
  onOpenReleaseConfirm,
}: Props) => {
  if (isLoading) {
    return (
      <AdminStateBlock
        type="empty"
        title="Đang tải dữ liệu ví"
        description="Hệ thống đang đồng bộ dữ liệu ví từ backend."
      />
    );
  }

  if (records.length === 0) {
    return (
      <AdminStateBlock
        type={search.trim() ? 'search-empty' : 'empty'}
        title={search.trim() ? 'Không tìm thấy bản ghi tài chính phù hợp' : 'Chưa có bản ghi tài chính'}
        description={
          search.trim()
            ? 'Thử đổi từ khóa hoặc đặt lại bộ lọc.'
            : 'Bản ghi tài chính sẽ xuất hiện khi có dữ liệu đơn hàng.'
        }
        actionLabel="Đặt lại bộ lọc"
        onAction={onResetCurrentView}
      />
    );
  }

  return (
    <>
      <div className="admin-table" role="table" aria-label="Bảng đối soát tài chính sàn">
        <div className="admin-table-row financials admin-table-head" role="row">
          <div role="columnheader">
            <input
              type="checkbox"
              checked={selected.size === records.length && records.length > 0}
              onChange={(event) =>
                onSelectionChange(
                  event.target.checked ? new Set(records.map((item) => item.storeId)) : new Set(),
                )
              }
            />
          </div>
          <div role="columnheader">STT</div>
          <div role="columnheader">Tên cửa hàng</div>
          <div role="columnheader">Slug cửa hàng</div>
          <div role="columnheader">Khả dụng</div>
          <div role="columnheader">Đóng băng</div>
          <div role="columnheader">Hành động</div>
        </div>

        {records.map((record, index) => (
          <motion.div
            key={record.id}
            className="admin-table-row financials"
            role="row"
            whileHover={{ y: -1 }}
          >
            <div role="cell" onClick={(event) => event.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(record.storeId)}
                onChange={(event) => {
                  const next = new Set(selected);
                  if (event.target.checked) next.add(record.storeId);
                  else next.delete(record.storeId);
                  onSelectionChange(next);
                }}
              />
            </div>
            <div role="cell" className="admin-mono">
              {(page - 1) * PAGE_SIZE + index + 1}
            </div>
            <div role="cell">
              <div className="admin-bold">{record.storeName}</div>
            </div>
            <div role="cell">
              <div className="admin-bold">{toStoreRef(record)}</div>
            </div>
            <div role="cell" className="admin-bold">
              <span className={`admin-pill ${record.availableBalance > 0 ? 'success' : 'neutral'}`}>
                {formatCurrency(record.availableBalance)}
              </span>
            </div>
            <div role="cell">
              <span className={`admin-pill ${record.frozenBalance > 0 ? 'warning' : 'neutral'}`}>
                {formatCurrency(record.frozenBalance)}
              </span>
            </div>
            <div role="cell" className="financial-actions">
              <button className="admin-icon-btn subtle" title="Xem chi tiết" onClick={() => onOpenDetail(record)}>
                <Eye size={16} />
              </button>
              {record.availableBalance > 0 && (
                <button
                  className="admin-icon-btn subtle"
                  title="Duyệt phiếu rút đang chờ"
                  onClick={() => onOpenReleaseConfirm([record.storeId])}
                >
                  <CheckCircle2 size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="table-footer">
        <span className="table-footer-meta">Trang {page}/{totalPages}</span>
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(Math.max(page - 1, 1))}>
            Trước
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                className={`page-btn ${page === pageNumber ? 'active' : ''}`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          >
            Sau
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminFinancialWalletsPanel;
