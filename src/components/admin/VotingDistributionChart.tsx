
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { PartyVoteStats } from "@/types/api";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface VotingDistributionChartProps {
  data: PartyVoteStats[];
}

const VotingDistributionChart = ({ data }: VotingDistributionChartProps) => {
  // Map party IDs to short names and colors
  const partyMap = {
    "PTY-001": { short: "INC", color: "#0078D7", full: "Indian National Congress" },
    "PTY-002": { short: "BJP", color: "#FF9933", full: "Bharatiya Janata Party" },
    "PTY-003": { short: "AAP", color: "#019934", full: "Aam Aadmi Party" },
    "PTY-005": { short: "NOTA", color: "#6B7280", full: "None Of The Above" }
  };
  
  // Format data for chart, filtering out NF party
  const chartData = data
    .filter(party => party.partyId !== "PTY-004") // Filter out NF party
    .map((party) => {
    const partyInfo = partyMap[party.partyId as keyof typeof partyMap] || { 
      short: party.partyName?.substring(0, 3) || "UNK", 
      color: "#8884d8",
      full: party.partyName || "Unknown"
    };
    
    return {
      name: partyInfo.short,
      fullName: partyInfo.full,
      value: party.votes,
      percentage: party.percentage,
      fill: partyInfo.color,
    };
  });

  const chartConfig = {
    votes: {
      label: "Votes",
    },
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="w-full h-full"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Party Distribution</h3>
        <Badge variant="outline" className="text-xs">Live Results</Badge>
      </div>
      
      <ChartContainer className="h-[240px]" config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius={70}
              innerRadius={30}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              // Simplified labels to prevent overflow
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle" 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ fontSize: 10, paddingTop: 15 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );
};

// Custom tooltip component to show party full names
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg p-2 rounded-md text-xs">
        <p className="font-medium">{data.fullName}</p>
        <p>Votes: <span className="font-mono">{data.value.toLocaleString()}</span></p>
        <p>Share: <span className="font-mono">{data.percentage.toFixed(2)}%</span></p>
      </div>
    );
  }
  return null;
};

export default VotingDistributionChart;
