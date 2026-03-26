import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import './Auth.css';
import { useToast } from '../../contexts/ToastContext';
import { getUiErrorMessage } from '../../utils/errorMessage';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Vui lÃ²ng nháº­p email');
      return;
    }

    setError(null);

    try {
      setLoading(true);
      await authService.forgot(email.trim());
      addToast('ÄÃ£ gá»­i hÆ°á»›ng dáº«n Ä‘áº·t láº¡i máº­t kháº©u (mock)', 'success');
    } catch (errorValue: unknown) {
      addToast(getUiErrorMessage(errorValue, 'Gá»­i yÃªu cáº§u tháº¥t báº¡i'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">QuÃªn máº­t kháº©u</h1>
        <p className="auth-subtitle">Nháº­p email Ä‘á»ƒ nháº­n hÆ°á»›ng dáº«n Ä‘áº·t láº¡i máº­t kháº©u.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label>Email</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            {error && <div className="auth-error">{error}</div>}
          </div>

          <div className="auth-actions">
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <><Loader2 size={18} className="auth-spinner" /> Äang gá»­i...</> : <><Mail size={18} /> Gá»­i hÆ°á»›ng dáº«n</>}
            </button>
            <div className="auth-secondary">
              ÄÃ£ nhá»› máº­t kháº©u? <Link to="/login">ÄÄƒng nháº­p</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
