import { useCallback, useEffect, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { addressService } from '../../services/addressService';
import type { Address } from '../../types';
import './AddressBookModal.css';

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
}

const AddressBookModal = ({ isOpen, onClose, onSelectAddress }: AddressBookModalProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const rows = await addressService.listFromBackend();
      setAddresses(rows);
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Không thể tải sổ địa chỉ. Vui lòng thử lại.';
      setLoadError(message);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    void loadAddresses();
  }, [isOpen, loadAddresses]);

  useEffect(() => {
    if (addresses.length === 0) {
      setSelectedId(null);
      return;
    }

    setSelectedId((prev) => {
      if (prev && addresses.some((address) => address.id === prev)) {
        return prev;
      }
      const defaultAddress = addresses.find((address) => address.isDefault);
      return defaultAddress?.id || addresses[0].id;
    });
  }, [addresses]);

  const handleSelect = () => {
    const selected = addresses.find((address) => address.id === selectedId);
    if (!selected) return;

    onSelectAddress(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="address-modal-overlay">
      <div className="address-modal-container">
        <div className="address-modal-header">
          <h2>Chọn từ sổ địa chỉ</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng">
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="address-modal-body">
          {isLoading ? (
            <div className="empty-address-msg">Đang tải sổ địa chỉ...</div>
          ) : null}

          {!isLoading && loadError ? (
            <div className="empty-address-msg">
              <p>{loadError}</p>
              <button className="address-confirm-btn" onClick={() => void loadAddresses()}>
                Tải lại
              </button>
            </div>
          ) : null}

          {!isLoading && !loadError && addresses.length === 0 ? (
            <div className="empty-address-msg">Bạn chưa có địa chỉ nào trong sổ.</div>
          ) : null}

          {!isLoading && !loadError && addresses.length > 0 ? (
            <div className="address-list">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  className={`address-item ${selectedId === address.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(address.id)}
                  aria-pressed={selectedId === address.id}
                >
                  <div className="address-item-header">
                    <span className="address-name">{address.fullName}</span>
                    {address.isDefault && <span className="address-badge">Mặc định</span>}
                  </div>
                  <div className="address-phone">{address.phone}</div>
                  <div className="address-full">
                    {addressService.formatFullAddress(address)}
                  </div>
                  {selectedId === address.id && (
                    <div className="address-check-icon">
                      <CheckCircle2 fill="var(--co-blue)" color="white" size={24} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="address-modal-footer">
          <button
            className="address-confirm-btn"
            onClick={handleSelect}
            disabled={!selectedId || isLoading || Boolean(loadError)}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressBookModal;
