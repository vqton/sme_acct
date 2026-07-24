import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send } from "lucide-react";

export default function TaxDeclarationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);

  const load = () => {
    if (id) {
      api.getTaxDeclaration(Number(id)).then(setData);
      api.getDeclarationAudit(Number(id)).then(setAudit).catch(() => {});
    }
  };

  useEffect(() => { load(); }, [id]);

  if (!data) return <div className="flex items-center justify-center h-64">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/accounting/tax")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold flex-1">Tờ khai #{data.id}</h1>
        <Badge>{data.status === 1 ? "Nháp" : data.status === 2 ? "Đã nộp" : data.status}</Badge>
        {data.status === 1 && <Button onClick={() => api.submitTaxDeclaration(data.id, user?.id).then(load)}><Send className="mr-2 h-4 w-4" />Nộp tờ khai</Button>}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">Loại thuế:</span> {data.taxType}</div>
            <div><span className="text-muted-foreground">Kỳ:</span> {data.periodId}</div>
            <div><span className="text-muted-foreground">Thuế phải nộp:</span> {data.totalTaxPayable?.toLocaleString()} VND</div>
          </div>
        </CardContent>
      </Card>

      {audit.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Lịch sử</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Thời gian</TableHead><TableHead>Hành động</TableHead><TableHead>Người</TableHead></TableRow></TableHeader>
              <TableBody>
                {audit.map((a: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{new Date(a.timestamp).toLocaleString("vi-VN")}</TableCell>
                    <TableCell>{a.action}</TableCell>
                    <TableCell>{a.userName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
