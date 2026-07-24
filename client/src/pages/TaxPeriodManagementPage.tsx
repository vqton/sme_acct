import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Lock, Unlock, CheckCircle } from "lucide-react";

const periodStatus: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  1: { label: "Mở", variant: "default" },
  2: { label: "Khóa", variant: "secondary" },
  3: { label: "Hoàn thành", variant: "outline" },
  4: { label: "Sửa đổi", variant: "destructive" },
};

export default function TaxPeriodManagementPage() {
  const { companyId, user } = useAuth();
  const [periods, setPeriods] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ year: new Date().getFullYear(), type: "VAT" });

  const load = () => { if (companyId) api.getTaxPeriods(companyId).then(setPeriods); };
  useEffect(() => { load(); }, [companyId]);

  const handleCreate = async () => {
    if (!companyId) return;
    await api.createTaxPeriods(companyId, form.year, form.type);
    setDialogOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kỳ thuế</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Tạo kỳ</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Năm</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.year}</TableCell>
                  <TableCell>{p.taxType}</TableCell>
                  <TableCell><Badge variant={periodStatus[p.status]?.variant ?? "outline"}>{periodStatus[p.status]?.label ?? p.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.status === 1 && <Button variant="ghost" size="icon" onClick={() => api.lockTaxPeriod(p.id, user?.id ?? 0).then(load)}><Lock className="h-4 w-4" /></Button>}
                      {p.status === 2 && <Button variant="ghost" size="icon" onClick={() => api.finalizeTaxPeriod(p.id, user?.id ?? 0).then(load)}><CheckCircle className="h-4 w-4" /></Button>}
                      {p.status >= 2 && <Button variant="ghost" size="icon" onClick={() => api.unlockTaxPeriod(p.id, user?.id ?? 0, "Admin unlock").then(load)}><Unlock className="h-4 w-4" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo kỳ thuế mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Năm</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Loại thuế</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="CIT">CIT</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
