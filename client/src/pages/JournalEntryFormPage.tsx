import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface Line {
  accountId: number;
  debit: string;
  credit: string;
  description: string;
}

export default function JournalEntryFormPage() {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({ entryDate: new Date().toISOString().split("T")[0], description: "" });
  const [lines, setLines] = useState<Line[]>([
    { accountId: 0, debit: "", credit: "", description: "" },
    { accountId: 0, debit: "", credit: "", description: "" },
  ]);

  useEffect(() => {
    if (companyId) api.getAccounts(companyId).then((data: any) => setAccounts(data.data || data));
  }, [companyId]);

  const updateLine = (i: number, field: keyof Line, value: string | number) => {
    const next = [...lines];
    (next[i] as any)[field] = value;
    setLines(next);
  };

  const addLine = () => setLines([...lines, { accountId: 0, debit: "", credit: "", description: "" }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanced) return;
    await api.createJournalEntry({
      companyId: companyId!,
      entryDate: form.entryDate,
      description: form.description,
      lines: lines.filter(l => l.accountId > 0).map(l => ({
        accountId: l.accountId,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description,
      })),
    });
    navigate("/accounting/journal-entries");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/accounting/journal-entries")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold">Tạo bút toán mới</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ngày hạch toán</Label><Input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Diễn giải chung</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hạch toán</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="mr-2 h-4 w-4" />Thêm dòng</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_120px_1fr_auto] gap-2 items-end">
                <div className="space-y-1">
                  {i === 0 && <Label className="text-xs">Tài khoản</Label>}
                  <Select value={String(line.accountId)} onValueChange={(v) => updateLine(i, "accountId", Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Chọn TK" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.code} - {a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  {i === 0 && <Label className="text-xs">Nợ</Label>}
                  <Input type="number" placeholder="0" value={line.debit} onChange={(e) => updateLine(i, "debit", e.target.value)} />
                </div>
                <div className="space-y-1">
                  {i === 0 && <Label className="text-xs">Có</Label>}
                  <Input type="number" placeholder="0" value={line.credit} onChange={(e) => updateLine(i, "credit", e.target.value)} />
                </div>
                <div className="space-y-1">
                  {i === 0 && <Label className="text-xs">Diễn giải</Label>}
                  <Input value={line.description} onChange={(e) => updateLine(i, "description", e.target.value)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)} className="mb-0.5"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <div className="flex justify-end gap-8 text-sm font-medium pt-2 border-t">
              <span>Tổng nợ: {totalDebit.toLocaleString()}</span>
              <span>Tổng có: {totalCredit.toLocaleString()}</span>
              <span className={balanced ? "text-green-600" : "text-destructive"}>{balanced ? "Cân bằng" : "Không cân bằng"}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/accounting/journal-entries")}>Hủy</Button>
          <Button type="submit" disabled={!balanced}>Tạo bút toán</Button>
        </div>
      </form>
    </div>
  );
}
