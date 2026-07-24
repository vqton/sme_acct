import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function TwoFactorVerifyPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tempToken = searchParams.get("tempToken");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Xác minh thất bại");
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác minh thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Xác minh 2FA</CardTitle>
          <CardDescription>Nhập mã 6 chữ số từ ứng dụng authenticator</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="code">Mã xác minh</Label>
              <Input id="code" placeholder="000000" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} disabled={loading} className="text-center text-lg tracking-widest" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác minh
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
