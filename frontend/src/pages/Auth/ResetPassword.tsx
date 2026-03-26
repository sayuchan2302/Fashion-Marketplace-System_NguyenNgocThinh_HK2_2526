import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LockKeyhole } from 'lucide-react';
import './Auth.css';
import { useToast } from '../../contexts/ToastContext';
import { getUiErrorMessage } from '../../utils/errorMessage';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!password.trim()) next.password = 'Vui lÃ²ng nháº­p máº­t kháº©u má»›i';
    else if (password.trim().length < 6) next.password = 'Tá»‘i thiá»ƒu 6 kÃ½ tá»±';
    if (confirm.trim() !== password.trim()) next.confirm = 'Máº­t kháº©u khÃ´ng khá»›p';
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);
      await authService.reset(password.trim());
      addToast('Äáº·t láº¡i máº­t kháº©u thÃ nh cÃ´ng (mock)', 'success');
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      addToast(getUiErrorMessage(error, 'Äáº·t láº¡i máº­t kháº©u tháº¥t báº¡i'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Äáº·t láº¡i máº­t kháº©u</h1>
        <p className="auth-subtitle">Nháº­p máº­t kháº©u má»›i cho tÃ i khoáº£n cá»§a báº¡n.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label>Máº­t kháº©u má»›i</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
            {errors.password && <div className="auth-error">{errors.password}</div>}
          </div>

          <div className="auth-field">
            <label>Nháº­p láº¡i máº­t kháº©u</label>
            <input
              className="auth-input"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
            {errors.confirm && <div className="auth-error">{errors.confirm}</div>}
          </div>

          <div className="auth-actions">
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <><Loader2 size={18} className="auth-spinner" /> Äang Ä‘áº·t láº¡i...</> : <><LockKeyhole size={18} /> Äáº·t láº¡i máº­t kháº©u</>}
            </button>
            <div className="auth-secondary">
              Nhá»› máº­t kháº©u rá»“i? <Link to="/login">ÄÄƒng nháº­p</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
