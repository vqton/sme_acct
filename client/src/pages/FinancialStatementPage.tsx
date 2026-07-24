import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FinancialStatementPage() {
  const { companyId } = useAuth();
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState<string>("");
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [incomeStatement, setIncomeStatement] = useState<any>(null);

  useEffect(() => {
    if (companyId) api.getFiscalPeriods(companyId).then(setPeriods);
  }, [companyId]);

  useEffect(() => {
    if (periodId && companyId) {
      api.getBalanceSheet(companyId, Number(periodId)).then(setBalanceSheet);
      api.getIncomeStatement(companyId, Number(periodId)).then(setIncomeStatement);
    }
  }, [periodId, companyId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Báo cáo tài chính</h1>
      <Select value={periodId} onValueChange={setPeriodId}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Kỳ kế toán" /></SelectTrigger>
        <SelectContent>
          {periods.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.year}/{p.month}</SelectItem>)}
        </SelectContent>
      </Select>
      <Tabs defaultValue="balance-sheet">
        <TabsList>
          <TabsTrigger value="balance-sheet">Bảng cân đối kế toán (B01-DN)</TabsTrigger>
          <TabsTrigger value="income-statement">Kết quả kinh doanh (B02-DN)</TabsTrigger>
        </TabsList>
        <TabsContent value="balance-sheet">
          <Card><CardContent className="pt-6">
            {balanceSheet ? (
              <pre className="text-sm">{JSON.stringify(balanceSheet, null, 2)}</pre>
            ) : <p className="text-muted-foreground">Chọn kỳ để xem</p>}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="income-statement">
          <Card><CardContent className="pt-6">
            {incomeStatement ? (
              <pre className="text-sm">{JSON.stringify(incomeStatement, null, 2)}</pre>
            ) : <p className="text-muted-foreground">Chọn kỳ để xem</p>}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
