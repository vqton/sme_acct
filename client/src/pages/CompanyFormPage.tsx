import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Company } from '../types';

export default function CompanyFormPage() {
  const { id: idStr } = useParams<{ id: string }>();
  const id = idStr ? Number(idStr) : undefined;
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '', nameVietnamese: '', nameEnglish: '', abbreviatedName: '',
    taxCode: '', enterpriseCode: '',
    headOfficeAddress: '', phone: '', email: '', website: '',
    charterCapital: '', paidInCapital: '',
    dateOfEstablishment: '', dateOfOperationCommencement: '',
    taxOfficeName: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getCompany(id)
      .then((c) => setForm({
        name: c.name || '',
        nameVietnamese: c.nameVietnamese || '',
        nameEnglish: c.nameEnglish || '',
        abbreviatedName: c.abbreviatedName || '',
        taxCode: c.taxCode || '',
        enterpriseCode: c.enterpriseCode || '',
        headOfficeAddress: c.headOfficeAddress || '',
        phone: c.phone || '',
        email: c.email || '',
        website: c.website || '',
        charterCapital: c.charterCapital?.toString() || '',
        paidInCapital: c.paidInCapital?.toString() || '',
        dateOfEstablishment: c.dateOfEstablishment || '',
        dateOfOperationCommencement: c.dateOfOperationCommencement || '',
        taxOfficeName: c.taxOfficeName || '',
      }))
      .catch(() => setError('Không thể tải thông tin công ty'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Vui lòng nhập tên công ty'); return; }

    setSaving(true);
    try {
      const payload: Partial<Company> = {
        name: form.name.trim(),
        nameVietnamese: form.nameVietnamese.trim() || undefined,
        nameEnglish: form.nameEnglish.trim() || undefined,
        abbreviatedName: form.abbreviatedName.trim() || undefined,
        taxCode: form.taxCode.trim() || undefined,
        enterpriseCode: form.enterpriseCode.trim() || undefined,
        headOfficeAddress: form.headOfficeAddress.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        website: form.website.trim() || undefined,
        charterCapital: form.charterCapital ? Number(form.charterCapital) : undefined,
        paidInCapital: form.paidInCapital ? Number(form.paidInCapital) : undefined,
        dateOfEstablishment: form.dateOfEstablishment || undefined,
        dateOfOperationCommencement: form.dateOfOperationCommencement || undefined,
        taxOfficeName: form.taxOfficeName.trim() || undefined,
      };
      if (!isEdit) {
        const created = await api.createCompany({ ...payload, status: 1 });
        navigate(`/companies/${created.id}`);
      } else {
        await api.updateCompany(id!, payload);
        navigate(`/companies/${id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Link to={id ? `/companies/${id}` : '/companies'} style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>
        &larr; {id ? 'Quay lại chi tiết' : 'Danh sách công ty'}
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '8px 0 20px' }}>
        {isEdit ? 'Sửa thông tin công ty' : 'Thêm công ty mới'}
      </h1>

      {error && (
        <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Tên công ty *" value={form.name} onChange={set('name')} required />
        <Field label="Tên tiếng Việt" value={form.nameVietnamese} onChange={set('nameVietnamese')} />
        <Field label="Tên tiếng Anh" value={form.nameEnglish} onChange={set('nameEnglish')} />
        <Field label="Tên viết tắt" value={form.abbreviatedName} onChange={set('abbreviatedName')} />
        <Field label="Mã số thuế" value={form.taxCode} onChange={set('taxCode')} />
        <Field label="Mã số doanh nghiệp" value={form.enterpriseCode} onChange={set('enterpriseCode')} />
        <Field label="Địa chỉ trụ sở" value={form.headOfficeAddress} onChange={set('headOfficeAddress')} span={2} />
        <Field label="Điện thoại" value={form.phone} onChange={set('phone')} />
        <Field label="Email" value={form.email} onChange={set('email')} type="email" />
        <Field label="Website" value={form.website} onChange={set('website')} />
        <Field label="Vốn điều lệ" value={form.charterCapital} onChange={set('charterCapital')} type="number" />
        <Field label="Vốn đã góp" value={form.paidInCapital} onChange={set('paidInCapital')} type="number" />
        <Field label="Ngày thành lập" value={form.dateOfEstablishment} onChange={set('dateOfEstablishment')} type="date" />
        <Field label="Ngày bắt đầu hoạt động" value={form.dateOfOperationCommencement} onChange={set('dateOfOperationCommencement')} type="date" />
        <Field label="Cơ quan thuế" value={form.taxOfficeName} onChange={set('taxOfficeName')} span={2} />

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <Link to={id ? `/companies/${id}` : '/companies'} style={{ padding: '10px 20px', fontSize: 14, color: '#666', background: '#fff', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>
            Hủy
          </Link>
          <button type="submit" disabled={saving} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: saving ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo công ty'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', required, span,
}: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; span?: number;
}) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#333' }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} required={required}
        style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }}
      />
    </div>
  );
}
