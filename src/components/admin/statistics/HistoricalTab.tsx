
import React from "react";
import { LineChart as LineChartIcon, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { historicalData } from "./mockData";

const HistoricalTab: React.FC = () => {
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
            className="h-72"
          >
            <BarChart 
              data={historicalData} 
              margin={{ top: 10, right: 30, left: 20, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
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
                formatter={(value: number) => [`${value}%`, 'Turnout']}
                wrapperStyle={{ fontSize: "12px" }}
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

export default HistoricalTab;
