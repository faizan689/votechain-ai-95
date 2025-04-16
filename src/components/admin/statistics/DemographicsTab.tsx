
import React from "react";
import { BarChart3, LineChart as LineChartIcon, PieChartIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { ageGroupData, genderData, generateHourlyTurnoutData } from "./mockData";

const hourlyTurnoutData = generateHourlyTurnoutData();

const DemographicsTab: React.FC = () => {
  // Ensure data arrays are not empty and values are properly initialized
  const safeAgeGroupData = ageGroupData || [];
  const safeGenderData = genderData || [];
  const safeHourlyData = hourlyTurnoutData || [];
  
  // Calculate total for gender data safely
  const genderTotal = safeGenderData.reduce((sum, d) => sum + (d.value || 0), 0);
  
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
            className="h-72"
          >
            <BarChart 
              data={safeAgeGroupData} 
              margin={{ top: 10, right: 30, left: 20, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis 
                label={{ 
                  value: 'Turnout %', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 10 } 
                }} 
                tick={{ fontSize: 10 }}
                width={40}
              />
              <Tooltip 
                formatter={(value: number | undefined, name: string, props: any) => {
                  if (props?.payload?.percent !== undefined) {
                    return [`${props.payload.percent}%`, 'Turnout'];
                  }
                  return ['--', 'Turnout'];
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
          <ChartContainer 
            config={{ 
              male: { color: "#0078D7" },
              female: { color: "#FF9933" },
              nonbinary: { color: "#019934" }
            }} 
            className="h-72"
          >
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Pie
                data={safeGenderData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                labelLine={{ strokeWidth: 0.5, stroke: "#666" }}
              >
                {safeGenderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number | undefined) => {
                  if (value !== undefined) {
                    return [`${value.toLocaleString()} voters`, 'Count'];
                  }
                  return ['0 voters', 'Count'];
                }} 
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {safeGenderData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="text-sm text-muted-foreground">{item.name}</div>
                <div className="text-xl font-bold">
                  {(item.value || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((item.value || 0) / (genderTotal || 1) * 100).toFixed(1)}%
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
            className="h-72"
          >
            <LineChart 
              data={safeHourlyData} 
              margin={{ top: 10, right: 30, left: 20, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis 
                label={{ 
                  value: 'Turnout %', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: 10 }
                }}
                width={40}
                tick={{ fontSize: 10 }}
              />
              <Tooltip wrapperStyle={{ fontSize: "12px" }} />
              <Line 
                type="monotone" 
                dataKey="turnout" 
                name="Hourly Turnout %"
                stroke="#FF9933" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
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

export default DemographicsTab;
