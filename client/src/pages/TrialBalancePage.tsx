import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TrialBalancePage() {
  const { companyId } = useAuth();
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState<string>("");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) api.getFiscalPeriods(companyId).then(setPeriods);
  }, [companyId]);

  useEffect(() => {
    if (periodId && companyId) {
      api.getTrialBalance(companyId, Number(periodId)).then(setData);
    }
  }, [periodId, companyId]);

  const totalDebit = data.reduce((s, r: any) => s + (r.debitBalance || 0), 0);
  const totalCredit = data.reduce((s, r: any) => s + (r.creditBalance || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bảng cân đối phát sinh</h1>
      <Select value={periodId} onValueChange={setPeriodId}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Kỳ kế toán" /></SelectTrigger>
        <SelectContent>
          {periods.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.year}/{p.month}</SelectItem>)}
        </SelectContent>
      </Select>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã TK</TableHead>
                <TableHead>Tên TK</TableHead>
                <TableHead className="text-right">Dư nợ</TableHead>
                <TableHead className="text-right">Dư có</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-mono">{r.accountCode}</TableCell>
                  <TableCell>{r.accountName}</TableCell>
                  <TableCell className="text-right">{r.debitBalance?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.creditBalance?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold border-t-2">
                <TableCell colSpan={2}>Tổng cộng</TableCell>
                <TableCell className="text-right">{totalDebit.toLocaleString()}</TableCell>
                <TableCell className="text-right">{totalCredit.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
