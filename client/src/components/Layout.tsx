import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 240, padding: 16, background: '#1a1a2e', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 18 }}>SME Accounting</h2>
        {user && (
          <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {user.fullName} (@{user.username})
          </p>
        )}
        <hr />
        <ul style={{ listStyle: 'none', padding: 0, flex: 1 }}>
          <li><Link to="/" style={{ color: 'white' }}>Dashboard</Link></li>
          <li><Link to="/companies" style={{ color: 'white' }}>Companies</Link></li>
          <li><Link to="/sessions" style={{ color: 'white' }}>Sessions</Link></li>
          <li><Link to="/2fa/setup" style={{ color: 'white' }}>2FA Setup</Link></li>
        </ul>
        <button
          onClick={handleLogout}
          style={{
            padding: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', cursor: 'pointer', borderRadius: 4,
          }}
        >
          Logout
        </button>
      </nav>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
