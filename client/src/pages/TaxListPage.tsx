import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send } from "lucide-react";

export default function TaxListPage() {
  const { companyId } = useAuth();
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState<string>("");
  const [declarations, setDeclarations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (companyId) api.getTaxPeriods(companyId).then(setPeriods);
  }, [companyId]);

  useEffect(() => {
    if (companyId && periodId) {
      api.listTaxDeclarations(companyId, Number(periodId)).then(setDeclarations);
    }
  }, [companyId, periodId]);

  const handleSubmit = async (id: number) => {
    await api.submitTaxDeclaration(id);
    if (companyId && periodId) api.listTaxDeclarations(companyId, Number(periodId)).then(setDeclarations);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Khai thuế</h1>
        <Button onClick={() => navigate("/accounting/tax/new")}><Plus className="mr-2 h-4 w-4" />Tạo mới</Button>
      </div>
      <Select value={periodId} onValueChange={setPeriodId}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Kỳ thuế" /></SelectTrigger>
        <SelectContent>
          {periods.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.year} - {p.taxType}</SelectItem>)}
        </SelectContent>
      </Select>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại thuế</TableHead>
                <TableHead>Kỳ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thuế phải nộp</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="cursor-pointer hover:underline" onClick={() => navigate(`/accounting/tax/${d.id}`)}>{d.taxType}</TableCell>
                  <TableCell>{d.periodId}</TableCell>
                  <TableCell><Badge variant={d.status === 2 ? "default" : "secondary"}>{d.status === 1 ? "Nháp" : d.status === 2 ? "Đã nộp" : d.status}</Badge></TableCell>
                  <TableCell className="text-right">{d.totalTaxPayable?.toLocaleString()}</TableCell>
                  <TableCell>
                    {d.status === 1 && <Button size="sm" variant="ghost" onClick={() => handleSubmit(d.id)}><Send className="h-4 w-4" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
