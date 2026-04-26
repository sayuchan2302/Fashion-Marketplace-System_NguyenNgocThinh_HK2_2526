import type { CSSProperties, FormEvent } from 'react';
import { User, X } from 'lucide-react';

interface ProfileAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  accountName: string;
  onAccountNameChange: (value: string) => void;
  accountPhone: string;
  onAccountPhoneChange: (value: string) => void;
  accountGender: 'MALE' | 'FEMALE' | 'OTHER';
  onAccountGenderChange: (value: 'MALE' | 'FEMALE' | 'OTHER') => void;
  accountDateOfBirth: string;
  onAccountDateOfBirthChange: (value: string) => void;
  height: string;
  onHeightChange: (value: string) => void;
  weight: string;
  onWeightChange: (value: string) => void;
  isSavingProfile: boolean;
}

const ProfileAccountModal = ({
  isOpen,
  onClose,
  onSubmit,
  accountName,
  onAccountNameChange,
  accountPhone,
  onAccountPhoneChange,
  accountGender,
  onAccountGenderChange,
  accountDateOfBirth,
  onAccountDateOfBirthChange,
  height,
  onHeightChange,
  weight,
  onWeightChange,
  isSavingProfile,
}: ProfileAccountModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <div className="profile-modal-header">
          <div>
            <p className="profile-modal-eyebrow">Hồ sơ cá nhân</p>
            <h2>Cập nhật thông tin</h2>
          </div>
          <button className="profile-modal-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="profile-modal-body">
          <form className="profile-modal-form" onSubmit={onSubmit}>
            <div className="modal-input-group">
              <span className="modal-floating-label">Họ và tên</span>
              <User className="modal-input-icon" size={18} aria-hidden="true" />
              <input
                type="text"
                className="modal-input"
                value={accountName}
                onChange={(event) => onAccountNameChange(event.target.value)}
                autoComplete="name"
                name="name"
                required
              />
            </div>

            <div className="modal-input-group">
              <span className="modal-floating-label">Số điện thoại</span>
              <div className="modal-input-icon">
                <img src="https://flagcdn.com/w20/vn.png" alt="VN Flag" className="w-5 h-auto rounded-sm" />
              </div>
              <input
                type="text"
                className="modal-input"
                value={accountPhone}
                onChange={(event) => onAccountPhoneChange(event.target.value)}
              />
            </div>

            <div className="modal-flex-row gap-6 items-center">
              <label className="modal-radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={accountGender === 'MALE'}
                  onChange={() => onAccountGenderChange('MALE')}
                />
                <span className="radio-custom"></span>
                Nam
              </label>
              <label className="modal-radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={accountGender === 'FEMALE'}
                  onChange={() => onAccountGenderChange('FEMALE')}
                />
                <span className="radio-custom"></span>
                Nữ
              </label>
              <label className="modal-radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="OTHER"
                  checked={accountGender === 'OTHER'}
                  onChange={() => onAccountGenderChange('OTHER')}
                />
                <span className="radio-custom"></span>
                Khác
              </label>
            </div>

            <div className="modal-input-group">
              <span className="modal-floating-label">Ngày sinh</span>
              <input
                type="date"
                className="modal-input"
                style={{ paddingLeft: '16px' }}
                value={accountDateOfBirth}
                onChange={(event) => onAccountDateOfBirthChange(event.target.value)}
              />
            </div>

            <div className="modal-slider-group">
              <span className="modal-slider-label">Chiều cao</span>
              <input
                type="range"
                min="100"
                max="190"
                value={height}
                onChange={(event) => onHeightChange(event.target.value)}
                className="modal-slider mx-4"
                style={{ '--val': `${((Number(height) - 100) / (190 - 100)) * 100}%` } as CSSProperties}
              />
              <span className="modal-slider-val text-co-black font-bold">{height}cm</span>
            </div>

            <div className="modal-slider-group">
              <span className="modal-slider-label">Cân nặng</span>
              <input
                type="range"
                min="30"
                max="90"
                value={weight}
                onChange={(event) => onWeightChange(event.target.value)}
                className="modal-slider mx-4"
                style={{ '--val': `${((Number(weight) - 30) / (90 - 30)) * 100}%` } as CSSProperties}
              />
              <span className="modal-slider-val text-co-black font-bold">{weight}kg</span>
            </div>

            <button type="submit" className="modal-submit-btn">
              {isSavingProfile ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT THÔNG TIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccountModal;
