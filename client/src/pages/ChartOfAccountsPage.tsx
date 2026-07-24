import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Sprout } from "lucide-react";

const categoryLabels: Record<number, string> = {
  1: "Tài sản", 2: "Nợ phải trả", 3: "Vốn chủ sở hữu",
  4: "Doanh thu", 5: "Chi phí", 6: "Xác định KQ",
};

export default function ChartOfAccountsPage() {
  const { companyId } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ accountNumber: "", name: "", category: 1 });

  const load = () => {
    if (!companyId) { setLoading(false); return; }
    api.getAccounts(companyId, { query: search || undefined }).then((data: any) => setAccounts(data.data || data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, companyId]);

  const handleCreate = async () => {
    if (!companyId) return;
    await api.createAccount({ ...form, companyId });
    setDialogOpen(false);
    setForm({ accountNumber: "", name: "", category: 1 });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa tài khoản?")) return;
    await api.deleteAccount(id);
    load();
  };

  const handleSeed = async () => {
    if (!companyId || !confirm("Seed chart of accounts mặc định?")) return;
    await api.seedAccounts(companyId);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed}><Sprout className="mr-2 h-4 w-4" />Seed</Button>
          <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Thêm</Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
              ) : accounts.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Chưa có tài khoản nào. Nhấn "Seed" để tạo mặc định.</TableCell></TableRow>
              ) : accounts.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono">{a.accountNumber}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell><Badge variant="outline">{categoryLabels[a.category] || a.category}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm tài khoản mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Mã tài khoản</Label><Input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tên tài khoản</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
