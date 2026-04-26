import { ChevronRight, Store, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FollowedStoreItem } from '../../../services/storeFollowService';

interface ProfileFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  followingStoresLoading: boolean;
  followingStoresError: string | null;
  followingStores: FollowedStoreItem[];
}

const ProfileFollowingModal = ({
  isOpen,
  onClose,
  followingStoresLoading,
  followingStoresError,
  followingStores,
}: ProfileFollowingModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal modal-sm profile-following-modal" onClick={(event) => event.stopPropagation()}>
        <div className="profile-modal-header">
          <div>
            <p className="profile-modal-eyebrow">Theo dõi</p>
            <h2>Shop bạn đang theo dõi</h2>
          </div>
          <button className="profile-modal-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="profile-modal-body">
          {followingStoresLoading ? (
            <p className="account-meta">Đang tải danh sách shop...</p>
          ) : null}
          {!followingStoresLoading && followingStoresError ? (
            <p className="account-meta">{followingStoresError}</p>
          ) : null}
          {!followingStoresLoading && !followingStoresError && followingStores.length === 0 ? (
            <div className="profile-following-empty">
              <Store size={28} />
              <p>Bạn chưa theo dõi shop nào</p>
            </div>
          ) : null}
          {!followingStoresLoading && !followingStoresError && followingStores.length > 0 ? (
            <div className="profile-following-list">
              {followingStores.map((storeItem) => (
                <Link
                  key={storeItem.storeId}
                  to={storeItem.storeSlug ? `/store/${encodeURIComponent(storeItem.storeSlug)}` : '#'}
                  className="profile-following-item"
                  onClick={onClose}
                >
                  <div className="profile-following-logo">
                    {storeItem.storeLogo ? (
                      <img src={storeItem.storeLogo} alt={storeItem.storeName} loading="lazy" />
                    ) : (
                      <span>{(storeItem.storeName.charAt(0) || 'S').toUpperCase()}</span>
                    )}
                  </div>
                  <div className="profile-following-content">
                    <p className="profile-following-name">{storeItem.storeName}</p>
                    <p className="profile-following-meta">
                      {storeItem.followerCount.toLocaleString('vi-VN')} người theo dõi
                    </p>
                    <p className="profile-following-meta">
                      Theo dõi từ{' '}
                      {storeItem.followedAt
                        ? new Date(storeItem.followedAt).toLocaleDateString('vi-VN')
                        : 'gần đây'}
                    </p>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfileFollowingModal;
