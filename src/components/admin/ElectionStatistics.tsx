
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Filter, Download, UserCheck, Users, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ageGroupData = [
  { name: "18-24", value: 32584, percent: 9 },
  { name: "25-34", value: 98745, percent: 27 },
  { name: "35-44", value: 87452, percent: 24 },
  { name: "45-54", value: 65324, percent: 18 },
  { name: "55-64", value: 52178, percent: 14 },
  { name: "65+", value: 29354, percent: 8 },
];

const genderData = [
  { name: "Male", value: 189432, color: "#0078D7" },
  { name: "Female", value: 172349, color: "#FF9933" },
  { name: "Non-binary", value: 3856, color: "#019934" },
];

const hourlyTurnoutData = Array.from({ length: 11 }, (_, i) => {
  const hour = i + 7; // Starting from 7 AM
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour > 12 ? hour - 12 : hour;
  
  return {
    time: `${hour12}${ampm}`,
    turnout: Math.round(5 + Math.random() * 8),
  };
});

const districtData = [
  { name: "North", total: 98432, voted: 45321, turnout: 46.04 },
  { name: "South", total: 87654, voted: 39842, turnout: 45.45 },
  { name: "East", total: 76543, voted: 34567, turnout: 45.16 },
  { name: "West", total: 91234, voted: 42134, turnout: 46.18 },
  { name: "Central", total: 65321, voted: 28123, turnout: 43.05 },
];

const historicalData = [
  { year: "2010", turnout: 58.7 },
  { year: "2014", turnout: 67.3 },
  { year: "2018", turnout: 63.5 },
  { year: "2023", turnout: 42.8 },
];

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

const DemographicsTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Turnout by Age Group
          </CardTitle>
          <CardDescription>
            Voter participation across different demographics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{ 
              turnout: { color: "#FF9933" } 
            }} 
            className="h-80"
          >
            <BarChart data={ageGroupData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Turnout %', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  return [`${props.payload.percent}%`, 'Turnout'];
                }}
              />
              <Bar dataKey="value" name="Voters" fill="var(--color-turnout)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Voters</div>
              <div className="text-xl font-bold">365,637</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Average Age</div>
              <div className="text-xl font-bold">42.7</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">First-time Voters</div>
              <div className="text-xl font-bold">24,893</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Gender Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of voter participation by gender
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-80">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                labelLine={true}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} voters`, 'Count']} 
              />
              <Legend />
            </PieChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {genderData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="text-sm text-muted-foreground">{item.name}</div>
                <div className="text-xl font-bold">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((item.value / genderData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Hourly Turnout Pattern
          </CardTitle>
          <CardDescription>
            Vote casting patterns throughout election day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{ 
              turnout: { color: "#FF9933" } 
            }} 
            className="h-80"
          >
            <LineChart data={hourlyTurnoutData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" />
              <YAxis label={{ value: 'Turnout %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="turnout" 
                name="Hourly Turnout %"
                stroke="#FF9933" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4">
          <div>Peak voting hour: 11AM - 12PM</div>
          <div>Lowest activity: 4PM - 5PM</div>
        </CardFooter>
      </Card>
    </div>
  );
};

const GeographyTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            District-wise Turnout
          </CardTitle>
          <CardDescription>
            Voter participation across electoral districts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{ 
              turnout: { color: "#FF9933" } 
            }} 
            className="h-80"
          >
            <BarChart 
              data={districtData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Turnout']} 
              />
              <Bar dataKey="turnout" name="Turnout %" fill="#FF9933" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            District Statistics
          </CardTitle>
          <CardDescription>
            Detailed breakdown by region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>District</TableHead>
                <TableHead className="text-right">Turnout %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districtData.map((district) => (
                <TableRow key={district.name}>
                  <TableCell className="font-medium">{district.name}</TableCell>
                  <TableCell className="text-right">{district.turnout.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">Highest turnout:</div>
              <div className="font-medium">West District (46.18%)</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">Lowest turnout:</div>
              <div className="font-medium">Central District (43.05%)</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">Variation:</div>
              <div className="font-medium">3.13%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const HistoricalTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Historical Voter Turnout
          </CardTitle>
          <CardDescription>
            Comparing turnout across previous elections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{ 
              turnout: { color: "#FF9933" } 
            }} 
            className="h-80"
          >
            <BarChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" />
              <YAxis label={{ value: 'Turnout %', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Turnout']} 
              />
              <Bar dataKey="turnout" name="Voter Turnout %" fill="#FF9933" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparative Analysis
          </CardTitle>
          <CardDescription>
            Change from previous elections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Turnout (2023)</div>
              <div className="text-3xl font-bold">42.8%</div>
              <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <span>↓ 20.7% from 2018</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Average Turnout (Last 4 Elections)</div>
              <div className="text-3xl font-bold">58.1%</div>
              <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <span>↓ 15.3% compared to average</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Highest Recorded Turnout</div>
              <div className="text-xl font-medium flex items-center justify-between">
                <span>67.3%</span>
                <span className="text-sm text-muted-foreground">(2014)</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Lowest Recorded Turnout</div>
              <div className="text-xl font-medium flex items-center justify-between">
                <span>42.8%</span>
                <span className="text-sm text-muted-foreground">(Current)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionStatistics;
