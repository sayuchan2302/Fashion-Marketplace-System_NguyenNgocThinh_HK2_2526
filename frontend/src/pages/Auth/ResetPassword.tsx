import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LockKeyhole } from 'lucide-react';
import './Auth.css';
import { useToast } from '../../contexts/ToastContext';
import { getUiErrorMessage } from '../../utils/errorMessage';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token')?.trim() || '';
  }, [location.search]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const hasToken = token.length > 0;

  const validate = () => {
    const next: typeof errors = {};
    if (!password.trim()) next.password = 'Vui lòng nhập mật khẩu mới';
    else if (password.trim().length < 6) next.password = 'Tối thiểu 6 ký tự';
    if (confirm.trim() !== password.trim()) next.confirm = 'Mật khẩu không khớp';
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hasToken) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);
      await authService.reset(token, password.trim());
      navigate('/login?reason=password-reset-success', { replace: true });
    } catch (error: unknown) {
      addToast(getUiErrorMessage(error, 'Đặt lại mật khẩu thất bại'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Đặt lại mật khẩu</h1>
        <p className="auth-subtitle">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        {!hasToken && (
          <div className="auth-error" role="alert">
            Lien ket dat lai mat khau khong hop le hoac da het han.
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label>Mật khẩu mới</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              disabled={!hasToken || loading}
            />
            {errors.password && <div className="auth-error">{errors.password}</div>}
          </div>

          <div className="auth-field">
            <label>Nhập lại mật khẩu</label>
            <input
              className="auth-input"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="••••••••"
              disabled={!hasToken || loading}
            />
            {errors.confirm && <div className="auth-error">{errors.confirm}</div>}
          </div>

          <div className="auth-actions">
            <button type="submit" className="auth-btn" disabled={!hasToken || loading}>
              {loading ? <><Loader2 size={18} className="auth-spinner" /> Đang đặt lại...</> : <><LockKeyhole size={18} /> Đặt lại mật khẩu</>}
            </button>
            <div className="auth-secondary">
              Nhớ mật khẩu rồi? <Link to="/login">Đăng nhập</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
