import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/auth/sessions").then(r => r.json()).then(setSessions).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const revoke = async (id: number) => {
    await fetch(`/api/auth/sessions/${id}`, { method: "DELETE" });
    load();
  };

  const revokeAll = async () => {
    if (!confirm("Xóa tất cả phiên đăng nhập khác?")) return;
    await fetch("/api/auth/sessions", { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phiên đăng nhập</h1>
        <Button variant="destructive" onClick={revokeAll}>Xóa tất cả khác</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thiết bị</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Đăng nhập lúc</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{s.userAgent || "Unknown"}</TableCell>
                  <TableCell>{s.ipAddress}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleString("vi-VN")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => revoke(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
