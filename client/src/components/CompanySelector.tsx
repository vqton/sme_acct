import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanySelector() {
  const { pendingCompanies, selectCompany } = useAuth();
  const navigate = useNavigate();

  if (pendingCompanies.length === 0) return null;

  const handleSelect = async (companyId: number) => {
    await selectCompany(companyId);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Chọn công ty</CardTitle>
          <CardDescription>
            Bạn có nhiều công ty. Vui lòng chọn công ty để đăng nhập.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingCompanies.map((company) => (
            <Button
              key={company.id}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => handleSelect(company.id)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold shrink-0">
                {company.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-medium">{company.name}</div>
                {company.role && (
                  <div className="text-xs text-muted-foreground">Vai trò: {company.role}</div>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
