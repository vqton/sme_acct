import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type {
  Company, LegalRepresentative, CapitalContributor,
  BusinessLine, CompanyBankAccount,
} from '../types';

const STATUS_LABELS: Record<number, string> = {
  1: 'Đang hoạt động',
  2: 'Tạm ngừng',
  3: 'Đã giải thể',
  4: 'Phá sản',
  5: 'Đã sáp nhập',
  6: 'Đang chuyển đổi',
};

const STATUS_COLORS: Record<number, string> = {
  1: '#16a34a',
  2: '#ca8a04',
  3: '#dc2626',
  4: '#991b1b',
  5: '#6b7280',
  6: '#2563eb',
};

type Tab = 'info' | 'legal-reps' | 'contributors' | 'business-lines' | 'bank-accounts';

function fmt(n?: number): string {
  if (n == null) return '—';
  return n.toLocaleString('vi-VN');
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [message, setMessage] = useState('');

  // Sub-resources
  const [legalReps, setLegalReps] = useState<LegalRepresentative[]>([]);
  const [contributors, setContributors] = useState<CapitalContributor[]>([]);
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [bankAccounts, setBankAccounts] = useState<CompanyBankAccount[]>([]);

  // Add-form visibility
  const [showAddLegalRep, setShowAddLegalRep] = useState(false);
  const [showAddContributor, setShowAddContributor] = useState(false);
  const [showAddBusinessLine, setShowAddBusinessLine] = useState(false);
  const [showAddBankAccount, setShowAddBankAccount] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getCompany(id),
      api.getLegalReps(id),
      api.getCapitalContributors(id),
      api.getBusinessLines(id),
      api.getBankAccounts(id),
    ])
      .then(([c, lr, cc, bl, ba]) => {
        setCompany(c);
        setLegalReps(lr);
        setContributors(cc);
        setBusinessLines(bl);
        setBankAccounts(ba);
      })
      .catch(() => setError('Không thể tải thông tin công ty'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleTransition(action: () => Promise<Company>, label: string) {
    try {
      const updated = await action();
      setCompany(updated);
      setMessage(`${label} thành công`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại';
      setError(msg);
    }
  }

  async function handleDeleteLegalRep(repId: string) {
    if (!id || !confirm('Xóa người đại diện pháp luật này?')) return;
    try {
      await api.deleteLegalRep(id, repId);
      setLegalReps((prev) => prev.filter((r) => r.id !== repId));
    } catch { setError('Không thể xóa người đại diện'); }
  }

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;
  if (!company) return <div style={{ padding: 24, textAlign: 'center', color: '#c33' }}>{error || 'Không tìm thấy công ty'}</div>;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'info', label: 'Thông tin chung' },
    { key: 'legal-reps', label: 'Người đại diện', count: legalReps.length },
    { key: 'contributors', label: 'Góp vốn', count: contributors.length },
    { key: 'business-lines', label: 'Ngành nghề', count: businessLines.length },
    { key: 'bank-accounts', label: 'Tài khoản NH', count: bankAccounts.length },
  ];

  const s = company.status;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <Link to="/companies" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>&larr; Danh sách công ty</Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '4px 0 4px' }}>{company.name}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#fff', background: STATUS_COLORS[s] || '#6b7280' }}>
              {STATUS_LABELS[s] || `Unknown (${s})`}
            </span>
            {company.taxCode && <span style={{ fontSize: 13, color: '#888' }}>MST: {company.taxCode}</span>}
            {company.enterpriseCode && <span style={{ fontSize: 13, color: '#888' }}>Mã DN: {company.enterpriseCode}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/companies/${company.id}/edit`} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>
            Sửa
          </Link>
        </div>
      </div>

      {message && <div style={{ padding: '8px 14px', marginBottom: 12, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 6, color: '#166534', fontSize: 13 }}>{message}</div>}
      {error && <div style={{ padding: '8px 14px', marginBottom: 12, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 13 }}>{error}</div>}

      {/* Status transitions */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {s === 2 && (
          <button onClick={() => handleTransition(() => api.activateCompany(company.id), 'Kích hoạt')} style={btnStyle('#16a34a')}>Kích hoạt</button>
        )}
        {s === 1 && (
          <button onClick={() => handleTransition(() => api.suspendCompany(company.id), 'Tạm ngừng')} style={btnStyle('#ca8a04')}>Tạm ngừng</button>
        )}
        {(s === 1 || s === 2) && (
          <>
            <button onClick={() => handleTransition(() => api.dissolveCompany(company.id), 'Giải thể')} style={btnStyle('#dc2626')}>Giải thể</button>
            <button onClick={() => handleTransition(() => api.bankruptCompany(company.id), 'Phá sản')} style={btnStyle('#991b1b')}>Phá sản</button>
          </>
        )}
        {s === 1 && (
          <button onClick={() => handleTransition(() => api.convertCompany(company.id), 'Chuyển đổi')} style={btnStyle('#2563eb')}>Chuyển đổi</button>
        )}
        {s !== 3 && s !== 4 && s !== 5 && (
          <button onClick={() => handleTransition(() => api.mergeCompany(company.id), 'Sáp nhập')} style={btnStyle('#7c3aed')}>Sáp nhập</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 20 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setError(''); }}
            style={{
              padding: '10px 18px', fontSize: 13, fontWeight: 500,
              color: activeTab === tab.key ? '#2563eb' : '#666',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab.label}{tab.count != null ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info' && <InfoTab company={company} />}
      {activeTab === 'legal-reps' && (
        <SubTab
          items={legalReps}
          columns={[
            { h: 'Họ tên', r: (r) => r.fullName },
            { h: 'Chức vụ', r: (r) => r.position },
            { h: 'Chính', r: (r) => r.isPrimary ? '✓' : '—' },
            { h: 'VNeID', r: (r) => r.vneidNumber || '—' },
          ]}
          showAdd={showAddLegalRep}
          setShowAdd={setShowAddLegalRep}
          onDelete={handleDeleteLegalRep}
          onAdd={async (data) => {
            if (!id) return;
            const rep = await api.addLegalRep(id, data);
            setLegalReps((prev) => [...prev, rep]);
            setShowAddLegalRep(false);
          }}
          addForm={
            <LegalRepForm
              onSubmit={async (data) => {
                if (!id) return;
                const rep = await api.addLegalRep(id, data);
                setLegalReps((prev) => [...prev, rep]);
                setShowAddLegalRep(false);
              }}
              onCancel={() => setShowAddLegalRep(false)}
            />
          }
        />
      )}
      {activeTab === 'contributors' && (
        <SubTab
          items={contributors}
          columns={[
            { h: 'Họ tên', r: (r) => r.fullName },
            { h: 'Vốn góp', r: (r) => `${fmt(r.capitalContribution)} đ` },
            { h: 'Tỷ lệ', r: (r) => `${r.ownershipRatio}%` },
            { h: 'Sáng lập', r: (r) => r.isFounder ? '✓' : '—' },
          ]}
          showAdd={showAddContributor}
          setShowAdd={setShowAddContributor}
          onAdd={async (data) => {
            if (!id) return;
            const cc = await api.addCapitalContributor(id, data);
            setContributors((prev) => [...prev, cc]);
            setShowAddContributor(false);
          }}
          addForm={
            <ContributorForm
              onSubmit={async (data) => {
                if (!id) return;
                const cc = await api.addCapitalContributor(id, data);
                setContributors((prev) => [...prev, cc]);
                setShowAddContributor(false);
              }}
              onCancel={() => setShowAddContributor(false)}
            />
          }
        />
      )}
      {activeTab === 'business-lines' && (
        <SubTab
          items={businessLines}
          columns={[
            { h: 'Tên ngành', r: (r) => r.name },
            { h: 'Mã VSIC', r: (r) => r.vsicCode },
            { h: 'Chính', r: (r) => r.isPrimary ? '✓' : '—' },
            { h: 'Ngày bắt đầu', r: (r) => r.startDate },
          ]}
          showAdd={showAddBusinessLine}
          setShowAdd={setShowAddBusinessLine}
          onAdd={async (data) => {
            if (!id) return;
            const bl = await api.addBusinessLine(id, data);
            setBusinessLines((prev) => [...prev, bl]);
            setShowAddBusinessLine(false);
          }}
          addForm={
            <BusinessLineForm
              onSubmit={async (data) => {
                if (!id) return;
                const bl = await api.addBusinessLine(id, data);
                setBusinessLines((prev) => [...prev, bl]);
                setShowAddBusinessLine(false);
              }}
              onCancel={() => setShowAddBusinessLine(false)}
            />
          }
        />
      )}
      {activeTab === 'bank-accounts' && (
        <SubTab
          items={bankAccounts}
          columns={[
            { h: 'Ngân hàng', r: (r) => r.bankName },
            { h: 'Số TK', r: (r) => r.accountNumber },
            { h: 'Chủ TK', r: (r) => r.accountName },
            { h: 'Loại tiền', r: (r) => r.currencyCode },
            { h: 'Mặc định', r: (r) => r.isPrimaryTaxPayment ? '✓' : '—' },
          ]}
          showAdd={showAddBankAccount}
          setShowAdd={setShowAddBankAccount}
          onAdd={async (data) => {
            if (!id) return;
            const ba = await api.addBankAccount(id, data);
            setBankAccounts((prev) => [...prev, ba]);
            setShowAddBankAccount(false);
          }}
          addForm={
            <BankAccountForm
              onSubmit={async (data) => {
                if (!id) return;
                const ba = await api.addBankAccount(id, data);
                setBankAccounts((prev) => [...prev, ba]);
                setShowAddBankAccount(false);
              }}
              onCancel={() => setShowAddBankAccount(false)}
            />
          }
        />
      )}
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff',
    background: color, border: 'none', borderRadius: 4, cursor: 'pointer',
  };
}

// ─── Info Tab ──────────────────────────────────────────────

function InfoTab({ company }: { company: Company }) {
  const fields: [string, string | undefined][] = [
    ['Tên tiếng Việt', company.nameVietnamese],
    ['Tên tiếng Anh', company.nameEnglish],
    ['Tên viết tắt', company.abbreviatedName],
    ['Mã số thuế', company.taxCode],
    ['Mã số DN', company.enterpriseCode],
    ['Địa chỉ', company.headOfficeAddress],
    ['Điện thoại', company.phone],
    ['Email', company.email],
    ['Website', company.website],
    ['Vốn điều lệ', company.charterCapital ? `${fmt(company.charterCapital)} đ` : undefined],
    ['Vốn đã góp', company.paidInCapital ? `${fmt(company.paidInCapital)} đ` : undefined],
    ['Ngày thành lập', company.dateOfEstablishment],
    ['Ngày bắt đầu HĐ', company.dateOfOperationCommencement],
    ['Cơ quan thuế', company.taxOfficeName],
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
      {fields.map(([label, value]) => (
        <div key={label} style={{ fontSize: 13 }}>
          <span style={{ color: '#888' }}>{label}:</span>{' '}
          <span style={{ color: '#1a1a2e', fontWeight: 500 }}>{value || '—'}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Generic SubTab ────────────────────────────────────────

interface Column<T> {
  h: string;
  r: (item: T) => string | React.ReactNode;
}

interface SubTabProps<T> {
  items: T[];
  columns: Column<T>[];
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
  onDelete?: (id: string) => void;
  onAdd: (data: any) => Promise<void>;
  addForm: React.ReactNode;
}

function SubTab<T extends { id: string }>({ items, columns, showAdd, setShowAdd, onDelete, addForm }: SubTabProps<T>) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {showAdd ? 'Hủy' : '+ Thêm mới'}
        </button>
      </div>
      {showAdd && <div style={{ marginBottom: 16 }}>{addForm}</div>}
      {items.length === 0 ? (
        <p style={{ color: '#888', fontSize: 13 }}>Chưa có dữ liệu.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {columns.map((col) => <th key={col.h} style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: '8px', color: '#555', fontWeight: 600 }}>{col.h}</th>)}
              {onDelete && <th style={{ borderBottom: '2px solid #ddd', padding: 8, width: 60 }}></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((col) => <td key={col.h} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{col.r(item)}</td>)}
                {onDelete && (
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    <button onClick={() => onDelete(item.id)} style={{ padding: '2px 8px', fontSize: 11, color: '#dc2626', background: '#fff', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer' }}>Xóa</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Add Forms ─────────────────────────────────────────────

function LegalRepForm({ onSubmit, onCancel }: { onSubmit: (data: any) => Promise<void>; onCancel: () => void }) {
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [vneidNumber, setVneidNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !position.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ fullName: fullName.trim(), position: position.trim(), isPrimary, vneidNumber: vneidNumber.trim() || undefined });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <input placeholder="Họ tên *" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
      <input placeholder="Chức vụ *" value={position} onChange={(e) => setPosition(e.target.value)} required style={inputStyle} />
      <input placeholder="Số VNeID" value={vneidNumber} onChange={(e) => setVneidNumber(e.target.value)} style={inputStyle} />
      <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
        Người đại diện chính
      </label>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '6px 14px', fontSize: 12, color: '#666', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>
        <button type="submit" disabled={saving} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: saving ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}

function ContributorForm({ onSubmit, onCancel }: { onSubmit: (data: any) => Promise<void>; onCancel: () => void }) {
  const [fullName, setFullName] = useState('');
  const [capitalContribution, setCapitalContribution] = useState('');
  const [ownershipRatio, setOwnershipRatio] = useState('');
  const [isFounder, setIsFounder] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !capitalContribution) return;
    setSaving(true);
    try {
      await onSubmit({
        fullName: fullName.trim(),
        capitalContribution: Number(capitalContribution),
        ownershipRatio: Number(ownershipRatio) || 0,
        isFounder,
        contributorType: 1,
        contributorCategory: 1,
        contributionDate: new Date().toISOString().split('T')[0],
      });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <input placeholder="Họ tên *" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
      <input placeholder="Số vốn góp *" type="number" value={capitalContribution} onChange={(e) => setCapitalContribution(e.target.value)} required style={inputStyle} />
      <input placeholder="Tỷ lệ %" type="number" step="0.01" value={ownershipRatio} onChange={(e) => setOwnershipRatio(e.target.value)} style={inputStyle} />
      <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={isFounder} onChange={(e) => setIsFounder(e.target.checked)} />
        Sáng lập viên
      </label>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '6px 14px', fontSize: 12, color: '#666', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>
        <button type="submit" disabled={saving} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: saving ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}

function BusinessLineForm({ onSubmit, onCancel }: { onSubmit: (data: any) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [vsicCode, setVsicCode] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !vsicCode.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(), vsicCode: vsicCode.trim(), isPrimary,
        vsicLevel: 4, startDate: new Date().toISOString().split('T')[0],
      });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <input placeholder="Tên ngành *" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
      <input placeholder="Mã VSIC *" value={vsicCode} onChange={(e) => setVsicCode(e.target.value)} required style={inputStyle} />
      <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
        Ngành chính
      </label>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '6px 14px', fontSize: 12, color: '#666', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>
        <button type="submit" disabled={saving} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: saving ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}

function BankAccountForm({ onSubmit, onCancel }: { onSubmit: (data: any) => Promise<void>; onCancel: () => void }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('VND');
  const [isPrimaryTaxPayment, setIsPrimaryTaxPayment] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountName.trim() || !bankName.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        accountNumber: accountNumber.trim(), accountName: accountName.trim(),
        bankName: bankName.trim(), currencyCode,
        isPrimaryTaxPayment, openedDate: new Date().toISOString().split('T')[0],
      });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <input placeholder="Ngân hàng *" value={bankName} onChange={(e) => setBankName(e.target.value)} required style={inputStyle} />
      <input placeholder="Số tài khoản *" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required style={inputStyle} />
      <input placeholder="Chủ tài khoản *" value={accountName} onChange={(e) => setAccountName(e.target.value)} required style={inputStyle} />
      <select value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} style={inputStyle}>
        <option value="VND">VND</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
      <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={isPrimaryTaxPayment} onChange={(e) => setIsPrimaryTaxPayment(e.target.checked)} />
        TK nộp thuế chính
      </label>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '6px 14px', fontSize: 12, color: '#666', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>
        <button type="submit" disabled={saving} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff', background: saving ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 4,
  boxSizing: 'border-box',
};
