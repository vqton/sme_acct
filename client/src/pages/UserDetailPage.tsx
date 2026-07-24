import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      userApi.getUser(Number(id)).then(setUser);
      userApi.getUserGroups(Number(id)).then((d) => setGroups(d.data)).catch(() => {});
    }
  }, [id]);

  if (!user) return <div className="flex items-center justify-center h-64">Đang tải...</div>;

  const handleDelete = async () => {
    if (!confirm("Xóa người dùng?")) return;
    await userApi.deleteUser(user.id);
    navigate("/users");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold flex-1">{user.fullName}</h1>
        <Button variant="outline" onClick={() => navigate(`/users/${id}/edit`)}>Sửa</Button>
        <Button variant="destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" />Xóa</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Thông tin tài khoản</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Tên đăng nhập:</span> {user.username}</div>
          <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
          <div><span className="text-muted-foreground">Họ tên:</span> {user.fullName}</div>
          <div><span className="text-muted-foreground">Trạng thái:</span> <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Hoạt động" : "Vô hiệu"}</Badge></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Vai trò</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.roles?.length > 0 ? user.roles.map((r: string) => <Badge key={r}>{r}</Badge>) : <p className="text-muted-foreground text-sm">Chưa có vai trò</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nhóm quyền</CardTitle></CardHeader>
        <CardContent>
          {groups.length > 0 ? groups.map((g: any) => <Badge key={g.id} variant="outline" className="mr-1">{g.name}</Badge>) : <p className="text-muted-foreground text-sm">Chưa thuộc nhóm nào</p>}
        </CardContent>
      </Card>
    </div>
  );
}
