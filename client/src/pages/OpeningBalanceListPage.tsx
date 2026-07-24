import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Lock, Unlock, Trash2 } from "lucide-react";

const obStatus: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  0: { label: "Nháp", variant: "secondary" },
  1: { label: "Chờ duyệt", variant: "outline" },
  2: { label: "Đã duyệt", variant: "default" },
  3: { label: "Khóa", variant: "destructive" },
  4: { label: "Kỳ đã đóng", variant: "secondary" },
};

export default function OpeningBalanceListPage() {
  const { companyId, user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    if (companyId) api.listOBByCompany(companyId).then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [companyId]);

  const handleLock = async (id: number) => { await api.lockOB(id, user?.id ?? 0); load(); };
  const handleUnlock = async (id: number) => { await api.unlockOB(id, user?.id ?? 0, "Admin unlock"); load(); };
  const handleDelete = async (id: number) => { if (confirm("Xóa?")) { await api.deleteOB(id); load(); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Số dư đầu kỳ</h1>
        <Button onClick={() => navigate("/accounting/opening-balance/new")}><Plus className="mr-2 h-4 w-4" />Thêm mới</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Diễn giải</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((ob: any) => (
                <TableRow key={ob.id}>
                  <TableCell className="cursor-pointer hover:underline" onClick={() => navigate(`/accounting/opening-balance/${ob.id}`)}>{ob.id}</TableCell>
                  <TableCell>{new Date(ob.entryDate).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>{ob.description}</TableCell>
                  <TableCell><Badge variant={obStatus[ob.status]?.variant ?? "outline"}>{obStatus[ob.status]?.label ?? ob.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {ob.status <= 1 && <Button variant="ghost" size="icon" onClick={() => handleLock(ob.id)}><Lock className="h-4 w-4" /></Button>}
                      {ob.status === 3 && <Button variant="ghost" size="icon" onClick={() => handleUnlock(ob.id)}><Unlock className="h-4 w-4" /></Button>}
                      {ob.status === 0 && <Button variant="ghost" size="icon" onClick={() => handleDelete(ob.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                    </div>
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
