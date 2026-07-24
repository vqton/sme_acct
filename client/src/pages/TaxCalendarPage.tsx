import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, AlertTriangle } from "lucide-react";

export default function TaxCalendarPage() {
  const { companyId } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) api.getTaxCalendar(companyId, year).then(setEvents);
  }, [companyId, year]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Lịch thuế</h1>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[year - 1, year, year + 1].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại thuế</TableHead>
                <TableHead>Kỳ</TableHead>
                <TableHead>Hạn nộp</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e: any, i: number) => {
                const isOverdue = new Date(e.deadline) < new Date() && e.status !== "completed";
                return (
                  <TableRow key={i}>
                    <TableCell>{e.taxType}</TableCell>
                    <TableCell>{e.period}</TableCell>
                    <TableCell className={isOverdue ? "text-destructive font-medium" : ""}>{new Date(e.deadline).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      <Badge variant={isOverdue ? "destructive" : e.status === "completed" ? "default" : "secondary"}>
                        {isOverdue && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {isOverdue ? "Quá hạn" : e.status === "completed" ? "Đã nộp" : "Chưa nộp"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
