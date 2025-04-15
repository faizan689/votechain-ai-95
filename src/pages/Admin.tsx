
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
import { Shield, Lock } from "lucide-react";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("turnout");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExternalWindow, setIsExternalWindow] = useState(false);
  const navigate = useNavigate();

  // Check if user is authorized on component mount
  useEffect(() => {
    console.log("Admin component mounted");
    
    // First check if this is opened in an external window
    const urlParams = new URLSearchParams(window.location.search);
    const externalParam = urlParams.get('external');
    const isExternal = externalParam === 'true';
    setIsExternalWindow(isExternal);

    // Check admin verification from URL parameter
    const adminVerifiedParam = urlParams.get('adminVerified');
    const isAdminVerified = adminVerifiedParam === 'true';
    
    console.log("External window:", isExternal);
    console.log("Admin verified from URL:", isAdminVerified);

    const checkAuth = () => {
      // Check if user has admin role
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      console.log("Is admin from localStorage:", isAdmin);
      
      // If opened in an external window but admin state isn't available,
      // check if parent window passed admin verification via URL parameter
      if (isExternal && !isAdmin && isAdminVerified) {
        console.log("Setting admin status from URL parameter");
        localStorage.setItem("isAdmin", "true");
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }
      
      setIsAuthorized(isAdmin);
      setIsLoading(false);
      
      if (!isAdmin && !isExternal) {
        toast.error("You don't have permission to access the admin panel");
        navigate('/', { replace: true });
      }
    };

    // Longer delay to ensure localStorage is properly checked and browser has time to initialize
    setTimeout(checkAuth, 300);
  }, [navigate]);

  // Function to authenticate in new window
  const promptForAdminCredentials = () => {
    const adminId = prompt("Enter admin ID:");
    const adminPassword = prompt("Enter admin password:");
    
    // Simple check for demo purposes
    if (adminId === "ADMIN123" && adminPassword === "admin123") {
      localStorage.setItem("isAdmin", "true");
      setIsAuthorized(true);
      setIsLoading(false);
    } else {
      toast.error("Invalid admin credentials");
      setIsLoading(false);
    }
  };
  
  // If in external window and not authorized, prompt for credentials
  useEffect(() => {
    if (isExternalWindow && !isAuthorized && !isLoading) {
      console.log("Prompting for admin credentials in external window");
      promptForAdminCredentials();
    }
  }, [isExternalWindow, isAuthorized, isLoading]);

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

  // If not authorized and tried authentication, show access denied
  if (!isAuthorized && isExternalWindow) {
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
              onClick={promptForAdminCredentials}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not authorized and in main window, redirect to home page
  if (!isAuthorized && !isExternalWindow) {
    return <Navigate to="/" replace />;
  }

  // Function to open admin panel in new window
  const openInNewWindow = () => {
    console.log("Opening admin panel in new window");
    const width = 1200;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      `/admin?external=true&adminVerified=true`, 
      'AdminPanel', 
      `width=${width},height=${height},top=${top},left=${left},toolbar=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow py-8 mt-20">
        <div className="container mx-auto px-4">
          <AdminHeader />
          
          {!isExternalWindow && (
            <div className="flex justify-end mb-4">
              <button
                onClick={openInNewWindow}
                className="text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-md flex items-center gap-2"
              >
                <span>Open in New Window</span>
              </button>
            </div>
          )}
          
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
