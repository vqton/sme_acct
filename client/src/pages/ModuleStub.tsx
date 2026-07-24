import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface Props {
  name: string;
  description: string;
}

export default function ModuleStub({ name, description }: Props) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Construction className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardTitle className="mt-2">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
          <p className="mt-4 text-sm text-muted-foreground">模块正在开发中...</p>
        </CardContent>
      </Card>
    </div>
  );
}
