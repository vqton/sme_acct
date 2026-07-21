import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { DashboardData, CompanyStatusCount } from '../types';

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

function fmt(n?: number): string {
  if (n == null) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} tr`;
  return n.toLocaleString('vi-VN');
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;
  if (!data) return <div style={{ padding: 24, textAlign: 'center', color: '#c33' }}>Không thể tải dữ liệu</div>;

  const { summary, companiesByStatus, recentCompanies } = data;
  const totalCap = fmt(summary.totalCharterCapital);
  const paidCap = fmt(summary.totalPaidInCapital);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px' }}>Tổng quan</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Công ty" value={summary.totalCompanies.toString()} sub={`Đang HĐ: ${summary.activeCompanies}`} />
        <KpiCard label="Vốn điều lệ" value={totalCap} sub={`Đã góp: ${paidCap}`} />
        <KpiCard label="Đại diện PL" value={summary.totalLegalReps.toString()} sub="Người đại diện" />
        <KpiCard label="Góp vốn" value={summary.totalContributors.toString()} sub="Thành viên" />
        <KpiCard label="TK ngân hàng" value={summary.totalBankAccounts.toString()} sub="Tài khoản" />
      </div>

      {/* Placeholder revenue card for future */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Doanh thu" value="—" sub="Sẽ cập nhật" dim />
        <KpiCard label="Chi phí" value="—" sub="Sẽ cập nhật" dim />
        <KpiCard label="Lợi nhuận" value="—" sub="Sẽ cập nhật" dim />
        <KpiCard label="Dòng tiền" value="—" sub="Sẽ cập nhật" dim />
        <KpiCard label="Công nợ PT" value="—" sub="Sẽ cập nhật" dim />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Company by Status - Donut */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '0 0 12px' }}>Công ty theo trạng thái</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <DonutChart data={companiesByStatus} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {companiesByStatus.map((s) => (
                <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[s.status] || '#6b7280', display: 'inline-block' }} />
                  <span style={{ color: '#555' }}>{STATUS_LABELS[s.status] || `Unknown (${s.status})`}</span>
                  <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Capital overview - bar chart */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '0 0 12px' }}>Vốn điều lệ & Đã góp</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
            {data.recentCompanies.slice(0, 5).map((c) => {
              const maxV = Math.max(summary.totalCharterCapital, 1);
              const w = ((c.charterCapital || 0) / maxV) * 100;
              return (
                <div key={c.id} style={{ fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ color: '#555' }}>{c.name}</span>
                    <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{fmt(c.charterCapital)}</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(w, 100)}%`, height: '100%', background: '#2563eb', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Companies Table */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Công ty mới nhất</h3>
          <Link to="/companies" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>Xem tất cả &rarr;</Link>
        </div>
        {recentCompanies.length === 0 ? (
          <p style={{ color: '#888', fontSize: 13 }}>Chưa có công ty nào.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: '8px', color: '#555', fontWeight: 600 }}>Tên</th>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: '8px', color: '#555', fontWeight: 600 }}>MST</th>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: '8px', color: '#555', fontWeight: 600 }}>Trạng thái</th>
                <th style={{ textAlign: 'right', borderBottom: '2px solid #ddd', padding: '8px', color: '#555', fontWeight: 600 }}>Vốn điều lệ</th>
              </tr>
            </thead>
            <tbody>
              {recentCompanies.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    <Link to={`/companies/${c.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>{c.name}</Link>
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee', color: '#888' }}>{c.taxCode || '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: STATUS_COLORS[c.status] || '#6b7280' }}>
                      {STATUS_LABELS[c.status] || `Unknown (${c.status})`}
                    </span>
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'right', color: '#1a1a2e' }}>{fmt(c.charterCapital)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, dim }: { label: string; value: string; sub: string; dim?: boolean }) {
  return (
    <div style={{
      background: dim ? '#f3f4f6' : '#fff',
      border: `1px solid ${dim ? '#e5e7eb' : '#e5e7eb'}`,
      borderRadius: 8, padding: '14px 12px',
      opacity: dim ? 0.6 : 1,
    }}>
      <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: dim ? '#9ca3af' : '#1a1a2e' }}>{value}</div>
      <div style={{ fontSize: 11, color: dim ? '#d1d5db' : '#aaa' }}>{sub}</div>
    </div>
  );
}

function DonutChart({ data }: { data: CompanyStatusCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888' }}>No data</div>;

  let cumulative = 0;
  const segments = data.map((d) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += d.count;
    const endAngle = (cumulative / total) * 360;
    return { ...d, startAngle, endAngle };
  });

  const r = 50;
  const cx = 60;
  const cy = 60;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
    const s = polarToCartesian(cx, cy, r, end);
    const e = polarToCartesian(cx, cy, r, start);
    const large = end - start > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
  }

  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {segments.map((s) => (
        <path key={s.status} d={describeArc(cx, cy, r, s.startAngle, s.endAngle)} fill={STATUS_COLORS[s.status] || '#6b7280'} stroke="#fff" strokeWidth={1} />
      ))}
      <circle cx={cx} cy={cy} r={28} fill="#f9fafb" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#888">Tổng</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={16} fontWeight={700} fill="#1a1a2e">{total}</text>
    </svg>
  );
}
