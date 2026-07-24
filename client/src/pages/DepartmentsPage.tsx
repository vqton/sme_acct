import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { departmentApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, FolderTree } from "lucide-react";

export default function DepartmentsPage() {
  const { companyId } = useParams();
  const cid = Number(companyId) || 1;
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = () => { departmentApi.list(cid).then(setDepartments); };
  useEffect(() => { load(); }, [cid]);

  const handleCreate = async () => {
    await departmentApi.create(cid, form);
    setDialogOpen(false);
    setForm({ name: "", description: "" });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa phòng ban?")) return;
    await departmentApi.delete(cid, id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phòng ban</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Thêm phòng ban</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên phòng ban</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/companies/${cid}/departments/${d.id}`)}>
                    <FolderTree className="inline mr-2 h-4 w-4" />{d.name}
                  </TableCell>
                  <TableCell>{d.description}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm phòng ban</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Tên phòng ban</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Mô tả</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
