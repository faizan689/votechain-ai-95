
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface HourlyActivityChartProps {
  totalVoters: number;
  totalVotesCast: number;
}

const HourlyActivityChart = ({ totalVoters, totalVotesCast }: HourlyActivityChartProps) => {
  // Generate hourly voting data
  const hourlyData = useMemo(() => {
    const data = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Generate some realistic voting pattern data
    // Higher turnout in morning and evening, lower in afternoon
    const hourlyPattern = [
      0.04, 0.07, 0.09, 0.08, 0.06, 0.05, 0.04, 0.05, 
      0.07, 0.08, 0.07, 0.06, 0.05, 0.06, 0.07, 0.09, 
      0.10, 0.11, 0.09, 0.07, 0.05, 0.03, 0.02, 0.01
    ];
    
    // Loop through hours from 8 AM to current hour or 8 PM, whichever is earlier
    const startHour = 8;
    const endHour = Math.min(20, currentHour);
    
    let cumulativeVotes = 0;
    for (let hour = startHour; hour <= endHour; hour++) {
      const hourVotes = Math.floor(totalVoters * hourlyPattern[hour]);
      cumulativeVotes += hourVotes;
      
      data.push({
        hour: `${hour}:00`,
        hourlyVotes: hourVotes,
        cumulativeVotes: cumulativeVotes,
      });
    }
    
    return data;
  }, [totalVoters, totalVotesCast]);
  
  // Chart configuration
  const chartConfig = {
    hourlyVotes: {
      label: "Hourly Votes",
    },
    cumulativeVotes: {
      label: "Total Votes",
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="w-full h-full"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">Hourly Voting Activity</h3>
        </div>
        <Badge variant="outline" className="text-xs">Trend Analysis</Badge>
      </div>

      <ChartContainer className="h-[240px]" config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hourlyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg p-2 rounded-md text-xs">
                      <p className="font-medium">{payload[0].payload.hour}</p>
                      <p>Hourly Votes: <span className="font-mono">{payload[0].payload.hourlyVotes.toLocaleString()}</span></p>
                      <p>Total Votes: <span className="font-mono">{payload[0].payload.cumulativeVotes.toLocaleString()}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="hourlyVotes" 
              name="Hourly Votes" 
              stroke="#8884d8" 
              fillOpacity={1} 
              fill="url(#hourlyGradient)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="cumulativeVotes" 
              name="Total Votes" 
              stroke="#82ca9d" 
              fillOpacity={1} 
              fill="url(#cumulativeGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );
};

export default HourlyActivityChart;
