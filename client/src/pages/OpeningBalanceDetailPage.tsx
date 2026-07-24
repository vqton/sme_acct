import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Unlock, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";

const obStatus: Record<number, string> = { 0: "Nháp", 1: "Chờ duyệt", 2: "Đã duyệt", 3: "Khóa", 4: "Kỳ đã đóng" };

export default function OpeningBalanceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  const load = () => {
    if (id) api.getOBDetail(Number(id)).then(setData);
  };

  useEffect(() => { load(); }, [id]);

  if (!data) return <div className="flex items-center justify-center h-64">Đang tải...</div>;

  const { header, lines } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/accounting/opening-balance")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold flex-1">Số dư đầu kỳ #{header.id}</h1>
        <Badge>{obStatus[header.status] ?? header.status}</Badge>
        <div className="flex gap-2">
          {header.status === 0 && <Button size="sm" onClick={() => api.submitOB(header.id).then(load)}><Send className="mr-2 h-4 w-4" />Gửi duyệt</Button>}
          {header.status === 1 && <Button size="sm" onClick={() => api.approveOB(header.id, user?.id ?? 0).then(load)}><CheckCircle className="mr-2 h-4 w-4" />Duyệt</Button>}
          {header.status === 1 && <Button size="sm" variant="destructive" onClick={() => api.rejectOB(header.id, user?.id ?? 0, "Rejected").then(load)}><XCircle className="mr-2 h-4 w-4" />Từ chối</Button>}
          {header.status < 3 && <Button size="sm" variant="outline" onClick={() => api.lockOB(header.id, user?.id ?? 0).then(load)}><Lock className="mr-2 h-4 w-4" />Khóa</Button>}
          {header.status === 3 && <Button size="sm" variant="outline" onClick={() => api.unlockOB(header.id, user?.id ?? 0, "Unlock").then(load)}><Unlock className="mr-2 h-4 w-4" />Mở khóa</Button>}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">Ngày:</span> {new Date(header.entryDate).toLocaleDateString("vi-VN")}</div>
            <div><span className="text-muted-foreground">Kỳ:</span> {header.periodId}</div>
            <div><span className="text-muted-foreground">Diễn giải:</span> {header.description}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Chi tiết số dư</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tài khoản</TableHead>
                <TableHead className="text-right">Nợ đầu kỳ</TableHead>
                <TableHead className="text-right">Có đầu kỳ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{l.accountCode} - {l.accountName}</TableCell>
                  <TableCell className="text-right">{l.openingDebit?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{l.openingCredit?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
