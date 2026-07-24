import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function PeriodClosePage() {
  const { companyId, user } = useAuth();
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState<string>("");
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyId) api.getFiscalPeriods(companyId).then(setPeriods);
  }, [companyId]);

  const handleValidate = async () => {
    if (!periodId || !companyId) return;
    setLoading(true);
    try {
      const result = await api.validateClose(companyId, Number(periodId));
      setValidation(result);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!periodId || !validation?.valid || !companyId) return;
    setLoading(true);
    try {
      await api.closePeriodWithValidation(companyId, Number(periodId), user?.id ?? 0);
      alert("Đóng kỳ thành công");
    api.getFiscalPeriods(companyId).then(setPeriods);
      setValidation(null);
      setPeriodId("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kết kỳ</h1>
      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Kỳ kế toán</label>
          <Select value={periodId} onValueChange={setPeriodId}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Chọn kỳ" /></SelectTrigger>
            <SelectContent>
              {periods.filter((p: any) => p.status === 1).map((p: any) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.year}/{p.month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleValidate} disabled={!periodId || loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Kiểm tra
        </Button>
        {validation?.valid && (
          <Button variant="destructive" onClick={handleClose} disabled={loading}>Đóng kỳ</Button>
        )}
      </div>

      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validation.valid ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
              Kết quả kiểm tra
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validation.valid ? (
              <p className="text-green-600">Đủ điều kiện đóng kỳ. Bạn có thể đóng kỳ an toàn.</p>
            ) : (
              <ul className="list-disc list-inside text-destructive space-y-1">
                {validation.errors?.map((e: string, i: number) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
