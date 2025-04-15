
import { Shield } from "lucide-react";

export const AdminLoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Shield className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-muted-foreground">Authenticating admin access...</p>
      </div>
    </div>
  );
};
