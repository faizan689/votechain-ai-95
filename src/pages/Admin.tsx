
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, User, BarChart3, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initializeSocket, joinElection, onVoteUpdate } from "@/lib/socket";
import { ElectionStats, SecurityLog } from "@/types/api";
import SecurityLogsTable from "@/components/admin/SecurityLogsTable";
import VotingDistributionChart from "@/components/admin/VotingDistributionChart";
import TurnoutChart from "@/components/admin/TurnoutChart";
import ElectionCountdown from "@/components/admin/ElectionCountdown";

const Admin = () => {
  // Election data state
  const [electionStats, setElectionStats] = useState<ElectionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Mock security logs
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
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

  // Election timing
  const electionEndTime = new Date();
  electionEndTime.setHours(electionEndTime.getHours() + 4); // End in 4 hours from now

  useEffect(() => {
    // Initialize the socket connection for real-time updates
    initializeSocket();
    joinElection();
    
    // Subscribe to vote updates
    const unsubscribe = onVoteUpdate((data) => {
      setElectionStats(data);
      setLoading(false);
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="security">Security Monitoring</TabsTrigger>
              <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Top cards row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Total Registered Voters</CardTitle>
                    <User className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? "Loading..." : electionStats?.totalRegisteredVoters.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total eligible voters
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? "Loading..." : electionStats?.totalVotesCast.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Live vote count
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Voter Turnout</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? "Loading..." : `${electionStats?.voterTurnoutPercentage.toFixed(1)}%`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Of registered voters
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Election Timeline</CardTitle>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <ElectionCountdown endTime={electionEndTime} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Until voting closes
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Party-wise Vote Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">Loading chart data...</div>
                    ) : (
                      <VotingDistributionChart data={electionStats?.partywiseVotes || []} />
                    )}
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>District-wise Turnout</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">Loading chart data...</div>
                    ) : (
                      <TurnoutChart data={electionStats?.districtWiseTurnout || []} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <CardTitle>Security Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <SecurityLogsTable logs={securityLogs} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Additional analytics features coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
