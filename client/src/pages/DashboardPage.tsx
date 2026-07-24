import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, TrendingUp, Users, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải...</div>;

  const stats = [
    { title: "Tổng công ty", value: data?.summary?.totalCompanies ?? 0, icon: Building2 },
    { title: "Đang hoạt động", value: data?.summary?.activeCompanies ?? 0, icon: TrendingUp, variant: "default" as const },
    { title: "Tạm đình chỉ", value: data?.summary?.suspendedCompanies ?? 0, icon: AlertTriangle, variant: "secondary" as const },
    { title: "Tổng vốn", value: `${((data?.summary?.totalCapital ?? 0) / 1_000_000).toFixed(0)}M`, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {data?.recent?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Công ty gần đây</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên công ty</TableHead>
                  <TableHead>Mã số thuế</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recent.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.taxCode}</TableCell>
                    <TableCell><Badge variant={c.status === 1 ? "default" : "secondary"}>{c.status === 1 ? "Hoạt động" : `Status ${c.status}`}</Badge></TableCell>
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
