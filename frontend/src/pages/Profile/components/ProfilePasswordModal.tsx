import type { FormEvent } from 'react';
import { Eye, EyeOff, Lock, X } from 'lucide-react';

interface ProfilePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  currentPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  showOldPassword: boolean;
  onToggleShowOldPassword: () => void;
  showNewPassword: boolean;
  onToggleShowNewPassword: () => void;
  showConfirmPassword: boolean;
  onToggleShowConfirmPassword: () => void;
  isChangingPassword: boolean;
}

const ProfilePasswordModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentPassword,
  onCurrentPasswordChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  showOldPassword,
  onToggleShowOldPassword,
  showNewPassword,
  onToggleShowNewPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword,
  isChangingPassword,
}: ProfilePasswordModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal modal-sm" onClick={(event) => event.stopPropagation()}>
        <div className="profile-modal-header">
          <div>
            <p className="profile-modal-eyebrow">Bảo mật</p>
            <h2>Đổi mật khẩu</h2>
          </div>
          <button className="profile-modal-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="profile-modal-body">
          <form className="profile-modal-form" onSubmit={onSubmit}>
            <div className="modal-input-group">
              <span className="modal-floating-label">Mật khẩu cũ</span>
              <Lock className="modal-input-icon text-gray-400" size={18} />
              <input
                type={showOldPassword ? 'text' : 'password'}
                className="modal-input pr-10"
                placeholder="Mật khẩu cũ"
                value={currentPassword}
                onChange={(event) => onCurrentPasswordChange(event.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={onToggleShowOldPassword}
                className="profile-modal-icon-btn"
                aria-label={showOldPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showOldPassword ? <EyeOff className="text-black" size={18} /> : <Eye className="text-black" size={18} />}
              </button>
            </div>

            <div className="modal-input-group">
              <span className="modal-floating-label hidden-if-empty">Mật khẩu mới</span>
              <Lock className="modal-input-icon text-gray-300" size={18} />
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="modal-input pr-10 text-gray-400"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(event) => onNewPasswordChange(event.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={onToggleShowNewPassword}
                className="profile-modal-icon-btn"
                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showNewPassword ? <EyeOff className="text-black" size={18} /> : <Eye className="text-black" size={18} />}
              </button>
            </div>

            <div className="modal-input-group">
              <span className="modal-floating-label hidden-if-empty">Nhập lại mật khẩu</span>
              <Lock className="modal-input-icon text-gray-300" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="modal-input pr-10 text-gray-400"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(event) => onConfirmPasswordChange(event.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={onToggleShowConfirmPassword}
                className="profile-modal-icon-btn"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff className="text-black" size={18} /> : <Eye className="text-black" size={18} />}
              </button>
            </div>

            <button type="submit" className="modal-submit-btn">
              {isChangingPassword ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT MẬT KHẨU'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePasswordModal;
