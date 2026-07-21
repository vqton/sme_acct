import { useAuth } from '../hooks/useAuth';

export default function CompanySelector() {
  const { pendingCompanies, selectCompany } = useAuth();

  if (pendingCompanies.length === 0) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Chọn công ty</h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Bạn có nhiều công ty. Vui lòng chọn công ty để đăng nhập.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => selectCompany(company.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                fontSize: 15,
                fontWeight: 500,
                color: '#1a1a2e',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                {company.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{company.name}</div>
                {company.role && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Vai trò: {company.role}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
