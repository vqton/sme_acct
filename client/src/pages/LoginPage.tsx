import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (result.requires2FA) {
        navigate(`/2fa/verify?tempToken=${result.tempToken}`);
        return;
      }
      if (result.requiresCompanySelection) {
        return;
      }
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
      if (msg.includes("locked")) {
        setError("Tài khoản bị khóa do nhập sai quá nhiều lần. Vui lòng thử lại sau.");
      } else if (msg.includes("disabled")) {
        setError("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
      } else if (msg.includes("Too many")) {
        setError("Quá nhiều lần thử. Vui lòng thử lại sau.");
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SME Accounting</CardTitle>
          <CardDescription>Hệ thống kế toán doanh nghiệp vừa và nhỏ</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
            <div className="flex items-center justify-between text-sm w-full">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Quên mật khẩu?
              </Link>
              <Link to="/register" className="text-primary hover:underline">
                Đăng ký
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
