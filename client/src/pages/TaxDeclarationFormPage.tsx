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

export default function TaxDeclarationFormPage() {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState<string>("");
  const [outputLines, setOutputLines] = useState<any[]>([{ description: "", amount: "", taxRate: 10 }]);
  const [inputLines, setInputLines] = useState<any[]>([{ description: "", amount: "", taxRate: 10 }]);

  useEffect(() => { if (companyId) api.getTaxPeriods(companyId).then(setPeriods); }, [companyId]);

  const updateLine = (setter: React.Dispatch<React.SetStateAction<any[]>>, i: number, field: string, value: any) => {
    setter((prev) => { const next = [...prev]; next[i] = { ...next[i], [field]: value }; return next; });
  };

  const addOutput = () => setOutputLines([...outputLines, { description: "", amount: "", taxRate: 10 }]);
  const addInput = () => setInputLines([...inputLines, { description: "", amount: "", taxRate: 10 }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodId) return;
    await api.createVatDeclaration(companyId!, Number(periodId), outputLines, inputLines);
    navigate("/accounting/tax");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/accounting/tax")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold">Tạo tờ khai thuế GTGT</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2"><Label>Kỳ thuế</Label>
              <Select value={periodId} onValueChange={setPeriodId}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Chọn kỳ" /></SelectTrigger>
                <SelectContent>{periods.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.year} - {p.taxType}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Doanh thu chịu thuế (Đầu ra)</CardTitle><Button type="button" variant="outline" size="sm" onClick={addOutput}><Plus className="mr-2 h-4 w-4" />Thêm</Button></CardHeader>
          <CardContent className="space-y-2">
            {outputLines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_80px_auto] gap-2 items-center">
                <Input placeholder="Diễn giải" value={l.description} onChange={(e) => updateLine(setOutputLines, i, "description", e.target.value)} />
                <Input type="number" placeholder="Số tiền" value={l.amount} onChange={(e) => updateLine(setOutputLines, i, "amount", e.target.value)} />
                <Input type="number" placeholder="Thuế %" value={l.taxRate} onChange={(e) => updateLine(setOutputLines, i, "taxRate", Number(e.target.value))} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setOutputLines(outputLines.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Chi phí được khấu trừ (Đầu vào)</CardTitle><Button type="button" variant="outline" size="sm" onClick={addInput}><Plus className="mr-2 h-4 w-4" />Thêm</Button></CardHeader>
          <CardContent className="space-y-2">
            {inputLines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_80px_auto] gap-2 items-center">
                <Input placeholder="Diễn giải" value={l.description} onChange={(e) => updateLine(setInputLines, i, "description", e.target.value)} />
                <Input type="number" placeholder="Số tiền" value={l.amount} onChange={(e) => updateLine(setInputLines, i, "amount", e.target.value)} />
                <Input type="number" placeholder="Thuế %" value={l.taxRate} onChange={(e) => updateLine(setInputLines, i, "taxRate", Number(e.target.value))} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setInputLines(inputLines.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/accounting/tax")}>Hủy</Button>
          <Button type="submit">Tạo tờ khai</Button>
        </div>
      </form>
    </div>
  );
}
