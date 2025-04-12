
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TurnoutTracking from "@/components/admin/TurnoutTracking";
import ElectionProgress from "@/components/admin/ElectionProgress";
import VotingSchedule from "@/components/admin/VotingSchedule";
import WinningThreshold from "@/components/admin/WinningThreshold";
import ElectionStatistics from "@/components/admin/ElectionStatistics";
import FraudDetection from "@/components/admin/FraudDetection";
import Reports from "@/components/admin/Reports";
import AdminHeader from "@/components/admin/AdminHeader";
import SecurityLogs from "@/components/admin/SecurityLogs";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("turnout");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authorized on component mount
  useEffect(() => {
    const checkAuth = () => {
      // Check if user has admin role
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      setIsAuthorized(isAdmin);
      setIsLoading(false);
      
      if (!isAdmin) {
        toast.error("You don't have permission to access the admin panel");
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Authenticating admin access...</p>
        </div>
      </div>
    );
  }

  // If not authorized, redirect to home page
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow py-8 mt-20">
        <div className="container mx-auto px-4">
          <AdminHeader />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <Tabs defaultValue="turnout" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full h-auto">
                <TabsTrigger value="turnout">Turnout</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="threshold">Threshold</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
                <TabsTrigger value="fraud">Fraud Alerts</TabsTrigger>
                <TabsTrigger value="security">Security Logs</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="turnout" className="mt-0">
                  <TurnoutTracking />
                </TabsContent>
                
                <TabsContent value="progress" className="mt-0">
                  <ElectionProgress />
                </TabsContent>
                
                <TabsContent value="schedule" className="mt-0">
                  <VotingSchedule />
                </TabsContent>
                
                <TabsContent value="threshold" className="mt-0">
                  <WinningThreshold />
                </TabsContent>
                
                <TabsContent value="statistics" className="mt-0">
                  <ElectionStatistics />
                </TabsContent>
                
                <TabsContent value="fraud" className="mt-0">
                  <FraudDetection />
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <SecurityLogs />
                </TabsContent>
                
                <TabsContent value="reports" className="mt-0">
                  <Reports />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
