import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    userApi.listUsers({ query: query || undefined }).then((d) => setUsers(d.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Người dùng</h1>
        <Button onClick={() => navigate("/users/new")}><Plus className="mr-2 h-4 w-4" />Thêm mới</Button>
      </div>
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm kiếm..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-sm" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any) => (
                <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/users/${u.id}`)}>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.roles?.map((r: string) => <Badge key={r} variant="outline" className="mr-1">{r}</Badge>)}</TableCell>
                  <TableCell><Badge variant={u.isActive ? "default" : "secondary"}>{u.isActive ? "Hoạt động" : "Vô hiệu"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
