import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../i18n';

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 240, padding: 16, background: '#1a1a2e', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>SME Accounting</h2>
          <button
            onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}
          >
            {locale === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>
        {user && (
          <p style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {user.fullName} (@{user.username})
          </p>
        )}
        <hr />
        <ul style={{ listStyle: 'none', padding: 0, flex: 1 }}>
          <li><Link to="/" style={{ color: 'white' }}>{t('nav.dashboard')}</Link></li>
          <li><Link to="/companies" style={{ color: 'white' }}>{t('nav.companies')}</Link></li>
          <li><Link to="/sessions" style={{ color: 'white' }}>{t('nav.sessions')}</Link></li>
          <li><Link to="/2fa/setup" style={{ color: 'white' }}>{t('nav.2faSetup')}</Link></li>
        </ul>
        <button
          onClick={handleLogout}
          style={{
            padding: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', cursor: 'pointer', borderRadius: 4,
          }}
        >
          {t('nav.logout')}
        </button>
      </nav>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
