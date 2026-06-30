import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">✍️ BlogSpace</Link>
      <div className="nav-right">
        {user ? (
          <>
            <Link to="/posts/new" className="btn btn-primary btn-sm">✏️ New Post</Link>
            <span className="nav-user">👤 {user.name}</span>
            <button className="btn-icon" onClick={() => { logout(); navigate('/login'); }} title="Sign out">🚪</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-icon">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
