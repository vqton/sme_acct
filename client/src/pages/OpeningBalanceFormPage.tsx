import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function OpeningBalanceFormPage() {
  const { companyId, user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [form, setForm] = useState({ periodId: "", entryDate: new Date().toISOString().split("T")[0], description: "" });
  const [lines, setLines] = useState<any[]>([{ accountId: 0, openingDebit: "", openingCredit: "" }]);

  useEffect(() => {
    if (companyId) {
      api.getAccounts(companyId).then((d: any) => setAccounts(d.data || d));
      api.getFiscalPeriods(companyId).then(setPeriods);
    }
  }, [companyId]);

  const updateLine = (i: number, field: string, value: any) => {
    const next = [...lines];
    next[i] = { ...next[i], [field]: value };
    setLines(next);
  };

  const addLine = () => setLines([...lines, { accountId: 0, openingDebit: "", openingCredit: "" }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createOB({
      companyId: companyId!,
      periodId: Number(form.periodId),
      entryDate: form.entryDate,
      userId: user?.id ?? 0,
      description: form.description,
      lines: lines.filter(l => l.accountId > 0).map(l => {
        const account = accounts.find((a: any) => a.id === l.accountId);
        return {
          accountId: l.accountId,
          accountNumber: account?.code || "",
          accountName: account?.name || "",
          debitAmount: Number(l.openingDebit) || 0,
          creditAmount: Number(l.openingCredit) || 0,
        };
      }),
    });
    navigate("/accounting/opening-balance");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/accounting/opening-balance")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold">Tạo số dư đầu kỳ</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Kỳ kế toán</Label>
                <Select value={form.periodId} onValueChange={(v) => setForm({ ...form, periodId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn kỳ" /></SelectTrigger>
                  <SelectContent>{periods.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.year}/{p.month}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Ngày hạch toán</Label><Input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Diễn giải</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dòng số dư</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="mr-2 h-4 w-4" />Thêm dòng</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[1fr_150px_150px_auto] gap-2 items-end">
                <Select value={String(line.accountId)} onValueChange={(v) => updateLine(i, "accountId", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Tài khoản" /></SelectTrigger>
                  <SelectContent>{accounts.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.code} - {a.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Nợ" value={line.openingDebit} onChange={(e) => updateLine(i, "openingDebit", e.target.value)} />
                <Input type="number" placeholder="Có" value={line.openingCredit} onChange={(e) => updateLine(i, "openingCredit", e.target.value)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/accounting/opening-balance")}>Hủy</Button>
          <Button type="submit">Tạo</Button>
        </div>
      </form>
    </div>
  );
}
