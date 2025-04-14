
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Filter, Download, UserCheck, Users, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DemographicsTab from "./statistics/DemographicsTab";
import GeographyTab from "./statistics/GeographyTab";
import HistoricalTab from "./statistics/HistoricalTab";

const ElectionStatistics = () => {
  const [selectedTab, setSelectedTab] = useState("demographics");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold">Election Statistics & Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights into voter participation and trends
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full h-auto">
          <TabsTrigger value="demographics" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Voter Demographics</span>
          </TabsTrigger>
          <TabsTrigger value="geography" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Geographic Distribution</span>
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            <span>Historical Comparison</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="demographics" className="mt-0">
            <DemographicsTab />
          </TabsContent>
          
          <TabsContent value="geography" className="mt-0">
            <GeographyTab />
          </TabsContent>
          
          <TabsContent value="historical" className="mt-0">
            <HistoricalTab />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default ElectionStatistics;
