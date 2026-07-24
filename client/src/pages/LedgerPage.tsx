import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LedgerPage() {
  const { companyId } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [periodId, setPeriodId] = useState<string>("");
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!companyId) return;
    api.getAccounts(companyId).then((d: any) => setAccounts(d.data || d));
    api.getFiscalPeriods(companyId).then(setPeriods);
  }, [companyId]);

  useEffect(() => {
    if (accountId && periodId && companyId) {
      api.getLedger(companyId, Number(accountId), Number(periodId)).then(setEntries);
    }
  }, [accountId, periodId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sổ cái</h1>
      <div className="flex gap-4">
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Tài khoản" /></SelectTrigger>
          <SelectContent>
            {accounts.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.code} - {a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={periodId} onValueChange={setPeriodId}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Kỳ kế toán" /></SelectTrigger>
          <SelectContent>
            {periods.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.year}/{p.month}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Số CT</TableHead>
                <TableHead>Diễn giải</TableHead>
                <TableHead className="text-right">Nợ</TableHead>
                <TableHead className="text-right">Có</TableHead>
                <TableHead className="text-right">Dư nợ</TableHead>
                <TableHead className="text-right">Dư có</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{new Date(e.entryDate).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="font-mono">{e.referenceNumber}</TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell className="text-right">{e.debit?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{e.credit?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{e.runningDebit?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{e.runningCredit?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
