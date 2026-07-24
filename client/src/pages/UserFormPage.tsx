import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const ROLES = ["admin", "accountant", "viewer", "hr_manager", "tax_officer", "department_head", "auditor", "payroll_officer", "inventory_manager", "sales_manager", "purchase_manager"];

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", fullName: "" });
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      userApi.getUser(Number(id)).then((u) => setForm({ username: u.username, email: u.email, fullName: u.fullName }));
      userApi.getUserRoles(Number(id)).then((d) => setRoles(d.roles));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && id) {
        await userApi.updateUser(Number(id), form);
      }
      navigate(`/users/${id || ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold">{isEdit ? "Sửa người dùng" : "Thêm người dùng"}</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Họ và tên</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} disabled={loading} /></div>
            <div className="space-y-2"><Label>Tên đăng nhập</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={loading || isEdit} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={loading} /></div>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Lưu</Button>
          </form>
        </CardContent>
      </Card>

      {isEdit && (
        <Card>
          <CardHeader><CardTitle>Vai trò</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <Button key={r} size="sm" variant={roles.includes(r) ? "default" : "outline"} onClick={async () => {
                if (roles.includes(r)) {
                  await userApi.removeRole(Number(id), r);
                } else {
                  await userApi.assignRole(Number(id), r);
                }
                userApi.getUserRoles(Number(id)).then((d) => setRoles(d.roles));
              }}>{r}</Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
