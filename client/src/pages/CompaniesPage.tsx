import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { Company } from "@/types";

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  1: { label: "Hoạt động", variant: "default" },
  2: { label: "Tạm đình chỉ", variant: "secondary" },
  3: { label: "Đã giải thể", variant: "destructive" },
  4: { label: "Phá sản", variant: "destructive" },
  5: { label: "Sáp nhập", variant: "outline" },
  6: { label: "Đang chuyển đổi", variant: "outline" },
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    api.getCompanies().then(setCompanies).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa công ty này?")) return;
    await api.deleteCompany(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Công ty</h1>
        <Button onClick={() => navigate("/companies/new")}><Plus className="mr-2 h-4 w-4" />Thêm mới</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên công ty</TableHead>
                <TableHead>Mã số thuế</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/companies/${c.id}`)}>{c.name}</TableCell>
                  <TableCell>{c.taxCode}</TableCell>
                  <TableCell><Badge variant={statusMap[c.status]?.variant ?? "outline"}>{statusMap[c.status]?.label ?? c.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && companies.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Chưa có công ty nào</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
