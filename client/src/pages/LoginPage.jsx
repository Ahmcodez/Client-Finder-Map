import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Log in to your lead workspace"
      subtitle="Access your saved leads, filtered business lists, and outreach-ready pitch messages."
      footerLabel="Create one"
      footerLink="/signup"
      footerText="Need an account?"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="input-base"
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          className="input-base"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        {error ? <div className="text-sm text-red-300">{error}</div> : null}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
