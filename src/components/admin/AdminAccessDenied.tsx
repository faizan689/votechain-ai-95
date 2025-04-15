
import { Lock } from "lucide-react";

interface AdminAccessDeniedProps {
  onRetry: () => void;
}

export const AdminAccessDenied = ({ onRetry }: AdminAccessDeniedProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <Lock className="w-16 h-16 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the admin panel
          </p>
          <button 
            onClick={onRetry}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
