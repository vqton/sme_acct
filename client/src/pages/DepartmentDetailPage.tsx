import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { departmentApi, userApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function DepartmentDetailPage() {
  const { companyId, id } = useParams();
  const cid = Number(companyId) || 1;
  const did = Number(id);
  const navigate = useNavigate();
  const [dept, setDept] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  const load = () => {
    departmentApi.getById(cid, did).then(setDept);
    departmentApi.getDepartmentUsers(cid, did).then(setUsers).catch(() => {});
  };

  useEffect(() => { load(); }, [cid, did]);

  if (!dept) return <div className="flex items-center justify-center h-64">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/companies/${cid}/departments`)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold flex-1">{dept.name}</h1>
        <Button variant="destructive" onClick={async () => { await departmentApi.delete(cid, did); navigate(`/companies/${cid}/departments`); }}><Trash2 className="mr-2 h-4 w-4" />Xóa</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Tên:</span> {dept.name}</div>
          <div><span className="text-muted-foreground">Mô tả:</span> {dept.description}</div>
          <div><span className="text-muted-foreground">Trạng thái:</span> <Badge variant={dept.isActive ? "default" : "secondary"}>{dept.isActive ? "Hoạt động" : "Vô hiệu"}</Badge></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Thành viên ({users.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Chính</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>{u.jobTitle}</TableCell>
                  <TableCell>{u.isPrimary ? <Badge>Chính</Badge> : ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
