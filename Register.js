import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>✍️ BlogSpace</h1>
        <p className="subtitle">Create your account</p>
        <label>Full Name</label>
        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
        <label>Email</label>
        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
        <p className="switch">Already have an account? <Link to="/login">Sign In</Link></p>
      </form>
    </div>
  );
}
