
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, Check, Eye, Info, AlertCircle, Lock, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AlertItem = {
  id: string;
  type: "high" | "medium" | "low";
  message: string;
  location: string;
  time: string;
  status: "new" | "investigating" | "resolved";
};

const alertsData: AlertItem[] = [
  {
    id: "a1",
    type: "high",
    message: "Multiple votes detected from same device ID",
    location: "North Delhi-08",
    time: "10:42 AM",
    status: "new"
  },
  {
    id: "a2",
    type: "high",
    message: "Unusual spike in votes for single party",
    location: "South Delhi-03",
    time: "11:15 AM",
    status: "investigating"
  },
  {
    id: "a3",
    type: "medium",
    message: "Vote pattern anomaly detected",
    location: "East Delhi-05",
    time: "09:23 AM",
    status: "investigating"
  },
  {
    id: "a4",
    type: "medium",
    message: "Unusual voting time pattern",
    location: "West Delhi-12",
    time: "08:47 AM",
    status: "resolved"
  },
  {
    id: "a5",
    type: "low",
    message: "Minor authentication anomaly",
    location: "Central Delhi-02",
    time: "12:05 PM",
    status: "resolved"
  }
];

const securityMetrics = [
  { name: "System Integrity", value: 98, target: 100 },
  { name: "Authentication Strength", value: 92, target: 95 },
  { name: "Encryption Status", value: 100, target: 100 },
  { name: "Intrusion Detection", value: 95, target: 95 },
  { name: "Audit Compliance", value: 97, target: 100 }
];

const FraudDetection = () => {
  const [selectedTab, setSelectedTab] = useState("alerts");
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsData);
  
  const alertsByType = {
    high: alerts.filter(a => a.type === "high"),
    medium: alerts.filter(a => a.type === "medium"),
    low: alerts.filter(a => a.type === "low")
  };
  
  const handleStatusChange = (id: string, newStatus: AlertItem["status"]) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: newStatus } : alert
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Fraud Detection System
            </CardTitle>
            <CardDescription>
              AI-powered monitoring for suspicious election activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Active Monitoring</AlertTitle>
              <AlertDescription>
                The system is actively scanning for suspicious activities across all polling stations.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatusCard 
                title="High Priority" 
                count={alertsByType.high.length} 
                color="red"
                icon={<AlertTriangle className="h-5 w-5" />}
              />
              <StatusCard 
                title="Medium Priority" 
                count={alertsByType.medium.length} 
                color="amber"
                icon={<AlertCircle className="h-5 w-5" />}
              />
              <StatusCard 
                title="Low Priority" 
                count={alertsByType.low.length} 
                color="green"
                icon={<Info className="h-5 w-5" />}
              />
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full h-auto">
                <TabsTrigger value="alerts">Current Alerts</TabsTrigger>
                <TabsTrigger value="security">Security Status</TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="alerts" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <div className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${alert.type === "high" 
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" 
                                : alert.type === "medium"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              }
                            `}>
                              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>{alert.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Detected at {alert.time}
                            </div>
                          </TableCell>
                          <TableCell>{alert.location}</TableCell>
                          <TableCell>
                            <select 
                              value={alert.status}
                              onChange={(e) => handleStatusChange(alert.id, e.target.value as AlertItem["status"])}
                              className="bg-background border border-input rounded-md p-1 text-xs w-full"
                            >
                              <option value="new">New</option>
                              <option value="investigating">Investigating</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <div className="space-y-6">
                    {securityMetrics.map((metric) => (
                      <div key={metric.name} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="text-sm font-medium">{metric.name}</div>
                          <div className="text-sm">
                            {metric.value}% / {metric.target}%
                          </div>
                        </div>
                        <Progress 
                          value={metric.value} 
                          className="h-2"
                          style={{
                            backgroundColor: 'rgba(100, 100, 100, 0.2)',
                            "--progress-foreground": metric.value === 100 
                              ? "#10b981" 
                              : metric.value >= 90 
                                ? "#f59e0b" 
                                : "#ef4444",
                          } as React.CSSProperties}
                        />
                      </div>
                    ))}
                    
                    <div className="flex justify-between p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg mt-6">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="font-medium">Overall Security Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Secure</span>
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              AI Detection Settings
            </CardTitle>
            <CardDescription>
              Configure anomaly detection sensitivity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Multiple Vote Detection</div>
                <Switch checked={true} />
              </div>
              <p className="text-sm text-muted-foreground">
                Detect multiple votes from same device or location
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Vote Pattern Analysis</div>
                <Switch checked={true} />
              </div>
              <p className="text-sm text-muted-foreground">
                Identify suspicious voting patterns or anomalies
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Authentication Verification</div>
                <Switch checked={true} />
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor for unauthorized access attempts
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Real-time Security Alerts</div>
                <Switch checked={true} />
              </div>
              <p className="text-sm text-muted-foreground">
                Send immediate notifications for critical issues
              </p>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="text-sm font-medium mb-3">Detection Sensitivity</div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="w-full">Low</Button>
                <Button variant="outline" size="sm" className="w-full bg-secondary/50">Medium</Button>
                <Button variant="outline" size="sm" className="w-full">High</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button>Save Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
};

interface StatusCardProps {
  title: string;
  count: number;
  color: "red" | "amber" | "green";
  icon: React.ReactNode;
}

const StatusCard = ({ title, count, color, icon }: StatusCardProps) => {
  const bgColor = {
    red: "bg-red-100 dark:bg-red-900/30",
    amber: "bg-amber-100 dark:bg-amber-900/30",
    green: "bg-green-100 dark:bg-green-900/30"
  };
  
  const textColor = {
    red: "text-red-800 dark:text-red-300",
    amber: "text-amber-800 dark:text-amber-300",
    green: "text-green-800 dark:text-green-300"
  };

  return (
    <div className={`${bgColor[color]} ${textColor[color]} rounded-lg p-4 text-center`}>
      <div className="flex justify-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs mt-1">{title}</div>
    </div>
  );
};

export default FraudDetection;
