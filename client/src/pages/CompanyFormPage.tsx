import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function CompanyFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", taxCode: "", address: "", phone: "", email: "",
    capital: "", industry: "", description: "",
  });

  useEffect(() => {
    if (isEdit) {
      api.getCompany(Number(id)).then((c) => {
        setForm({
          name: c.name || "", taxCode: c.taxCode || "", address: c.address || "",
          phone: c.phone || "", email: c.email || "", capital: String((c as any).capital || ""),
          industry: (c as any).industry || "", description: (c as any).description || "",
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, capital: form.capital ? Number(form.capital) : undefined };
      if (isEdit) {
        await api.updateCompany(Number(id), data);
      } else {
        await api.createCompany(data);
      }
      navigate("/companies");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? "Sửa công ty" : "Thêm công ty mới"}</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tên công ty *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Mã số thuế</Label><Input value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Địa chỉ</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Điện thoại</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Vốn (VND)</Label><Input type="number" value={form.capital} onChange={(e) => setForm({ ...form, capital: e.target.value })} /></div>
              <div className="space-y-2"><Label>Ngành nghề</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Mô tả</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/companies")}>Hủy</Button>
              <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEdit ? "Cập nhật" : "Tạo mới"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
