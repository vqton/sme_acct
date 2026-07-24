import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TwoFactorSetupPage() {
  const [data, setData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/2fa/setup")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Cài đặt xác minh 2FA</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Quét mã QR</CardTitle>
            <CardDescription>Sử dụng ứng dụng Google Authenticator hoặc Authy để quét</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <img src={data.qrCodeUrl} alt="QR Code" className="h-48 w-48" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Hoặc nhập thủ công:</p>
              <code className="block rounded bg-muted p-2 text-sm">{data.secret}</code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
