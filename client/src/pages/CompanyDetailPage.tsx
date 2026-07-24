import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit } from "lucide-react";
import type { Company } from "@/types";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [legalReps, setLegalReps] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [businessLines, setBusinessLines] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    api.getCompany(numId).then(setCompany);
    api.getLegalReps(numId).then(setLegalReps).catch(() => {});
    api.getCapitalContributors(numId).then(setContributors).catch(() => {});
    api.getBusinessLines(numId).then(setBusinessLines).catch(() => {});
    api.getBankAccounts(numId).then(setBankAccounts).catch(() => {});
  }, [id]);

  if (!company) return <div className="flex items-center justify-center h-64">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/companies")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold flex-1">{company.name}</h1>
        <Button onClick={() => navigate(`/companies/${id}/edit`)}><Edit className="mr-2 h-4 w-4" />Sửa</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Mã số thuế:</span> {company.taxCode}</div>
            <div><span className="text-muted-foreground">Trạng thái:</span> <Badge>{company.status}</Badge></div>
            <div><span className="text-muted-foreground">Địa chỉ:</span> {company.address}</div>
            <div><span className="text-muted-foreground">Điện thoại:</span> {company.phone}</div>
            <div><span className="text-muted-foreground">Email:</span> {company.email}</div>
            <div><span className="text-muted-foreground">Vốn:</span> {(company as any).capital?.toLocaleString()} VND</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="legal-reps">
        <TabsList>
          <TabsTrigger value="legal-reps">Đại diện pháp luật ({legalReps.length})</TabsTrigger>
          <TabsTrigger value="contributors">Cổ đông ({contributors.length})</TabsTrigger>
          <TabsTrigger value="business-lines">Ngành nghề ({businessLines.length})</TabsTrigger>
          <TabsTrigger value="bank-accounts">Tài khoản NH ({bankAccounts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="legal-reps">
          <Card><CardContent className="pt-6">
            <Table><TableHeader><TableRow><TableHead>Họ tên</TableHead><TableHead>Chức danh</TableHead></TableRow></TableHeader>
              <TableBody>{legalReps.map((r: any, i: number) => <TableRow key={i}><TableCell>{r.fullName}</TableCell><TableCell>{r.position}</TableCell></TableRow>)}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="contributors">
          <Card><CardContent className="pt-6">
            <Table><TableHeader><TableRow><TableHead>Họ tên</TableHead><TableHead>Vốn góp</TableHead></TableRow></TableHeader>
              <TableBody>{contributors.map((c: any, i: number) => <TableRow key={i}><TableCell>{c.fullName}</TableCell><TableCell>{c.capitalContribution?.toLocaleString()}</TableCell></TableRow>)}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="business-lines">
          <Card><CardContent className="pt-6">
            <Table><TableHeader><TableRow><TableHead>Mã VSIC</TableHead><TableHead>Tên ngành</TableHead></TableRow></TableHeader>
              <TableBody>{businessLines.map((b: any, i: number) => <TableRow key={i}><TableCell>{b.vsicCode}</TableCell><TableCell>{b.name}</TableCell></TableRow>)}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="bank-accounts">
          <Card><CardContent className="pt-6">
            <Table><TableHeader><TableRow><TableHead>Ngân hàng</TableHead><TableHead>Số TK</TableHead></TableRow></TableHeader>
              <TableBody>{bankAccounts.map((a: any, i: number) => <TableRow key={i}><TableCell>{a.bankName}</TableCell><TableCell>{a.accountNumber}</TableCell></TableRow>)}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
