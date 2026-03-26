import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import './Auth.css';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUiErrorMessage } from '../../utils/errorMessage';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Vui lÃ²ng nháº­p há» tÃªn';
    if (!email.trim()) next.email = 'Vui lÃ²ng nháº­p email';
    if (!password.trim()) next.password = 'Vui lÃ²ng nháº­p máº­t kháº©u';
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
      await register(name.trim(), email.trim(), password.trim());
      addToast('Táº¡o tÃ i khoáº£n thÃ nh cÃ´ng', 'success');
      navigate('/', { replace: true });
    } catch (error: unknown) {
      addToast(getUiErrorMessage(error, 'ÄÄƒng kÃ½ tháº¥t báº¡i'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">ÄÄƒng kÃ½</h1>
        <p className="auth-subtitle">Trá»Ÿ thÃ nh thÃ nh viÃªn Ä‘á»ƒ nháº­n Æ°u Ä‘Ã£i vÃ  theo dÃµi Ä‘Æ¡n hÃ ng dá»… dÃ ng.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label>Há» vÃ  tÃªn</label>
            <input
              className="auth-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nguyá»…n VÄƒn A"
            />
            {errors.name && <div className="auth-error">{errors.name}</div>}
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <div className="auth-error">{errors.email}</div>}
          </div>

          <div className="auth-field">
            <label>Máº­t kháº©u</label>
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
              {loading ? <><Loader2 size={18} className="auth-spinner" /> Äang táº¡o tÃ i khoáº£n...</> : <><Sparkles size={18} /> ÄÄƒng kÃ½</>}
            </button>
            <div className="auth-secondary">
              ÄÃ£ cÃ³ tÃ i khoáº£n? <Link to="/login">ÄÄƒng nháº­p</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
