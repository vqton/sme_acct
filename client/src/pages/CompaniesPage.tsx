import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Company } from '../types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCompanies()
      .then(setCompanies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Companies</h1>
      {companies.length === 0 ? (
        <p>No companies yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 8 }}>Tax Code</th>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{c.name}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{c.taxCode ?? '—'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
