
import React from "react";
import { motion } from "framer-motion";
import { User, UserCheck, Users, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const turnoutData = [
  { time: "7AM", turnout: 5 },
  { time: "8AM", turnout: 12 },
  { time: "9AM", turnout: 18 },
  { time: "10AM", turnout: 25 },
  { time: "11AM", turnout: 31 },
  { time: "12PM", turnout: 36 },
  { time: "1PM", turnout: 39 },
  { time: "2PM", turnout: 42 },
  { time: "3PM", turnout: 43 },
  { time: "4PM", turnout: 43 },
];

const demographicData = [
  { age: "18-24", percentage: 35 },
  { age: "25-34", percentage: 65 },
  { age: "35-44", percentage: 58 },
  { age: "45-54", percentage: 48 },
  { age: "55-64", percentage: 38 },
  { age: "65+", percentage: 30 },
];

const districtData = [
  { district: "North", registered: 120000, voted: 55000 },
  { district: "South", registered: 98000, voted: 42000 },
  { district: "East", registered: 88000, voted: 38000 },
  { district: "West", registered: 105000, voted: 44000 },
  { district: "Central", registered: 76000, voted: 28500 },
];

const TurnoutTracking = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Voter Turnout Over Time
            </CardTitle>
            <CardDescription>
              Hourly tracking of voter participation across all polling stations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{ 
                turnout: { color: "#FF9933" } 
              }} 
              className="h-80"
            >
              <BarChart data={turnoutData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: 'Turnout %', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="turnout" name="Voter Turnout %" fill="var(--color-turnout)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total Eligible Voters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">854,291</div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-muted-foreground">Target Turnout: 70%</div>
                <div className="text-sm font-medium">366,137 votes needed</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Current Turnout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">42.8%</div>
                <div className="text-xl font-medium">365,637 <span className="text-sm text-muted-foreground">votes</span></div>
              </div>
              <Progress value={42.8} className="h-2 mt-3" />
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-muted-foreground">Previous election: 67.3%</div>
                <div className="text-sm font-medium text-amber-500">-24.5%</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Demographic Turnout
            </CardTitle>
            <CardDescription>
              Voter turnout percentage by age group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demographicData.map((item) => (
                <div key={item.age} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{item.age}</div>
                    <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              District-wise Turnout
            </CardTitle>
            <CardDescription>
              Tracking voter participation across electoral districts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {districtData.map((item) => {
                const percentage = Math.round((item.voted / item.registered) * 100);
                return (
                  <div key={item.district} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{item.district} District</div>
                      <div className="text-sm text-muted-foreground">
                        {percentage}% ({item.voted.toLocaleString()} / {item.registered.toLocaleString()})
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md p-3 shadow-md text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-primary">{`Turnout: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export default TurnoutTracking;
