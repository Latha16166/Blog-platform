import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>✍️ BlogSpace</h1>
        <p className="subtitle">Welcome back!</p>
        <label>Email</label>
        <input type="email" required value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" required value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        <p className="switch">Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
