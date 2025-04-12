
import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Download, FileText, Filter, Shield, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample security log data
const securityLogs = [
  {
    id: "log-001",
    timestamp: "2023-05-22T09:32:14",
    type: "facial-verification",
    status: "failed",
    voter: "Unknown",
    voterID: "VOID-9876",
    location: "North District, Booth 12",
    description: "Failed facial recognition attempt. Confidence score: 38%.",
    severity: "high",
  },
  {
    id: "log-002",
    timestamp: "2023-05-22T10:15:09",
    type: "duplicate-vote",
    status: "blocked",
    voter: "Rahul Singh",
    voterID: "ABCD-1234",
    location: "South District, Booth 5",
    description: "Attempted to cast second vote. Previous vote recorded at 09:48 AM.",
    severity: "critical",
  },
  {
    id: "log-003",
    timestamp: "2023-05-22T11:29:57",
    type: "facial-verification",
    status: "failed",
    voter: "Unknown",
    voterID: "EFGH-5678",
    location: "East District, Booth 8",
    description: "Failed facial recognition attempt. Multiple retries detected.",
    severity: "high",
  },
  {
    id: "log-004",
    timestamp: "2023-05-22T12:03:22",
    type: "session-timeout",
    status: "warning",
    voter: "Priya Sharma",
    voterID: "IJKL-9012",
    location: "West District, Booth 3",
    description: "Voting session timed out before completion.",
    severity: "low",
  },
  {
    id: "log-005",
    timestamp: "2023-05-22T13:17:45",
    type: "duplicate-vote",
    status: "blocked",
    voter: "Suresh Kumar",
    voterID: "MNOP-3456",
    location: "Central District, Booth 7",
    description: "Attempted to cast vote with already used voter ID.",
    severity: "critical",
  },
  {
    id: "log-006",
    timestamp: "2023-05-22T14:22:31",
    type: "unauthorized-access",
    status: "blocked",
    voter: "Unknown",
    voterID: "N/A",
    location: "System",
    description: "Unauthorized API access attempt from IP 192.168.1.45.",
    severity: "critical",
  },
  {
    id: "log-007",
    timestamp: "2023-05-22T15:05:12",
    type: "facial-verification",
    status: "warning",
    voter: "Amit Patel",
    voterID: "QRST-7890",
    location: "North District, Booth 9",
    description: "Facial verification passed with low confidence (68%).",
    severity: "medium",
  },
];

const SecurityLogs = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter logs based on selected filter and search term
  const filteredLogs = securityLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.voter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.voterID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filter === "all" || log.type === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold">Security Logs</h2>
          <p className="text-muted-foreground">
            Monitor suspicious activities and security incidents
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="facial-verification">Facial Verification</SelectItem>
              <SelectItem value="duplicate-vote">Duplicate Votes</SelectItem>
              <SelectItem value="unauthorized-access">Unauthorized Access</SelectItem>
              <SelectItem value="session-timeout">Session Timeout</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search logs..."
              className="pl-10 w-full md:w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <X 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" 
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Incident Log
          </CardTitle>
          <CardDescription>
            Record of security incidents and suspicious activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Voter ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.type.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.voterID}</TableCell>
                      <TableCell>{log.location}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <AlertTriangle className="w-8 h-8 mb-2" />
                        <p>No security logs match your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {securityLogs.length} logs
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              <span>Export Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Failed Verification Summary</CardTitle>
            <CardDescription>Facial recognition failures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Attempts:</span>
                <span className="font-medium">1,245</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Verifications:</span>
                <span className="font-medium text-amber-600">37</span>
              </div>
              <div className="flex justify-between">
                <span>Failure Rate:</span>
                <span className="font-medium">2.97%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg. Confidence Score:</span>
                <span className="font-medium">94.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duplicate Vote Attempts</CardTitle>
            <CardDescription>Multiple voting prevention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Blocked:</span>
                <span className="font-medium text-red-600">12</span>
              </div>
              <div className="flex justify-between">
                <span>Highest District:</span>
                <span className="font-medium">Central (5)</span>
              </div>
              <div className="flex justify-between">
                <span>Investigation Pending:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Resolved:</span>
                <span className="font-medium text-green-600">9</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Security Status</CardTitle>
            <CardDescription>Platform health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>System Status:</span>
                <span className="font-medium text-green-600">Secure</span>
              </div>
              <div className="flex justify-between">
                <span>Last Security Scan:</span>
                <span className="font-medium">Today 12:45 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Active Admins:</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span>Unauthorized Access Attempts:</span>
                <span className="font-medium text-amber-600">5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default SecurityLogs;
