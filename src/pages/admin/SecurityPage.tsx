
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SecurityLogsTable from "@/components/admin/SecurityLogsTable";
import AdminLayout from "@/components/admin/AdminLayout";
import { useState } from "react";
import { SecurityLog } from "@/types/api";

// Animation variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const SecurityPage = () => {
  // Mock security logs
  const [securityLogs] = useState<SecurityLog[]>([
    {
      id: "log-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      type: "facial-verification",
      status: "failed",
      voter: "John Smith",
      voterID: "V-1234",
      location: "North District",
      description: "Low confidence score (42%)",
      severity: "medium",
    },
    {
      id: "log-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      type: "duplicate-vote",
      status: "blocked",
      voter: "Alice Johnson",
      voterID: "V-5678",
      location: "Central District",
      description: "Previous vote recorded at 10:22 AM",
      severity: "high",
    },
    {
      id: "log-003",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: "unauthorized-access",
      status: "blocked",
      voter: "Unknown",
      voterID: "N/A",
      location: "East District",
      description: "Multiple failed login attempts",
      severity: "critical",
    },
  ]);

  return (
    <AdminLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariant}
        className="space-y-6"
      >
        <motion.div variants={itemVariant}>
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="p-1.5 bg-red-50 rounded-full dark:bg-red-900/30">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <CardTitle>Security Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <SecurityLogsTable logs={securityLogs} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default SecurityPage;
