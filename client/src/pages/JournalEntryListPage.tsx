import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, RotateCcw, Trash2 } from "lucide-react";

export default function JournalEntryListPage() {
  const { companyId } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    if (companyId) api.getJournalEntries(companyId).then(setEntries).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [companyId]);

  const handlePost = async (id: number) => {
    await api.postJournalEntry(id);
    load();
  };

  const handleReverse = async (id: number) => {
    if (!confirm("Đảo bút toán này?")) return;
    await api.reverseJournalEntry(id);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa bút toán?")) return;
    await api.deleteJournalEntry(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bút toán</h1>
        <Button onClick={() => navigate("/accounting/journal-entries/new")}><Plus className="mr-2 h-4 w-4" />Thêm mới</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số CT</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Diễn giải</TableHead>
                <TableHead>Tổng nợ</TableHead>
                <TableHead>Tổng có</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono">{e.referenceNumber}</TableCell>
                  <TableCell>{new Date(e.entryDate).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="max-w-xs truncate">{e.description}</TableCell>
                  <TableCell className="text-right">{e.totalDebit?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{e.totalCredit?.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={e.status === "Posted" ? "default" : "secondary"}>{e.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {e.status === "Draft" && <Button variant="ghost" size="icon" onClick={() => handlePost(e.id)}><Send className="h-4 w-4" /></Button>}
                      {e.status === "Posted" && <Button variant="ghost" size="icon" onClick={() => handleReverse(e.id)}><RotateCcw className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
