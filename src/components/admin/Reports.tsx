
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, FileBarChart, FilePieChart, Printer, Share2, Filter, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ReportType = {
  id: string;
  name: string;
  description: string;
  format: "PDF" | "CSV" | "XLSX";
  lastGenerated: string;
  icon: React.ReactNode;
};

const reportTypes: ReportType[] = [
  {
    id: "turnout",
    name: "Voter Turnout Report",
    description: "Detailed breakdown of voter participation by demographics and location",
    format: "PDF",
    lastGenerated: "Today, 2:15 PM",
    icon: <FileText className="h-6 w-6 text-primary" />
  },
  {
    id: "results",
    name: "Election Results",
    description: "Complete tally of votes by party, candidate, and district",
    format: "PDF",
    lastGenerated: "Today, 2:10 PM",
    icon: <FilePieChart className="h-6 w-6 text-primary" />
  },
  {
    id: "analytics",
    name: "Statistical Analysis",
    description: "In-depth analytics of voting patterns and comparative data",
    format: "PDF",
    lastGenerated: "Today, 1:45 PM",
    icon: <FileBarChart className="h-6 w-6 text-primary" />
  },
  {
    id: "polling",
    name: "Polling Station Data",
    description: "Voter counts and activities by polling station",
    format: "CSV",
    lastGenerated: "Today, 1:30 PM",
    icon: <FileText className="h-6 w-6 text-primary" />
  },
  {
    id: "demographic",
    name: "Demographic Breakdown",
    description: "Voter participation by age, gender, and location",
    format: "XLSX",
    lastGenerated: "Today, 1:15 PM",
    icon: <FileBarChart className="h-6 w-6 text-primary" />
  }
];

const auditLogs = [
  { id: 1, action: "Generated Results Report", user: "Admin", timestamp: "Today, 2:10 PM", details: "PDF, 12 pages" },
  { id: 2, action: "Downloaded Voter Data", user: "Election Officer", timestamp: "Today, 1:32 PM", details: "CSV, 854,291 records" },
  { id: 3, action: "Printed Turnout Report", user: "Supervisor", timestamp: "Today, 12:45 PM", details: "PDF, 8 pages" },
  { id: 4, action: "Exported Analytics", user: "Data Analyst", timestamp: "Today, 11:23 AM", details: "XLSX, 5 sheets" },
  { id: 5, action: "Generated Verification Report", user: "Admin", timestamp: "Today, 10:05 AM", details: "PDF, 4 pages" }
];

const Reports = () => {
  const [selectedTab, setSelectedTab] = useState("generate");
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const handleGenerateReport = (reportId: string) => {
    setGeneratingReport(reportId);
    
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(null);
    }, 2000);
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
          <h2 className="text-2xl font-semibold">Election Reports</h2>
          <p className="text-muted-foreground">
            Generate and download comprehensive election data
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full h-auto mb-6">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="activity">Report Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    {report.icon}
                    <div className="text-xs font-medium px-2 py-1 bg-secondary rounded">
                      {report.format}
                    </div>
                  </div>
                  <CardTitle className="mt-4">{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Last generated: {report.lastGenerated}
                </CardContent>
                <CardFooter className="bg-secondary/30 border-t">
                  <div className="flex gap-2 w-full">
                    <Button 
                      className="flex-1"
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={generatingReport === report.id}
                    >
                      {generatingReport === report.id ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-1 h-4 w-4" />
                          Generate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Verification Reports
              </CardTitle>
              <CardDescription>
                Election integrity and verification documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <VerificationCard 
                    title="Ballot Verification" 
                    description="Confirms all votes were properly recorded and counted"
                    status="Complete"
                  />
                  <VerificationCard 
                    title="Audit Trail Report" 
                    description="Full log of all electronic voting system activities"
                    status="Complete"
                  />
                  <VerificationCard 
                    title="Observer Certification" 
                    description="Documentation from independent election observers"
                    status="Pending"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <Button className="gap-1">
                <Download className="h-4 w-4" />
                <span>Download All Verification Reports</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Report Generation Activity
              </CardTitle>
              <CardDescription>
                History of report exports and downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <Download className="h-3 w-3" />
                          <span>Redownload</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing recent activity only. For full logs, export the complete report.
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-4 w-4" />
                <span>Export Log</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

interface VerificationCardProps {
  title: string;
  description: string;
  status: "Complete" | "In Progress" | "Pending";
}

const VerificationCard = ({ title, description, status }: VerificationCardProps) => {
  const statusColor = {
    Complete: "text-green-600",
    "In Progress": "text-amber-600",
    Pending: "text-blue-600"
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <div className={`text-sm font-medium ${statusColor[status]}`}>
          {status}
        </div>
        <Button variant="outline" size="sm" className="h-8">
          <Download className="h-3 w-3 mr-1" />
          <span>Download</span>
        </Button>
      </div>
    </div>
  );
};

export default Reports;
