
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { PartyVoteStats } from "@/types/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface VotingDistributionChartProps {
  data: PartyVoteStats[];
}

const VotingDistributionChart = ({ data }: VotingDistributionChartProps) => {
  // Generate colors for each party if they don't have a color
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format data for chart
  const chartData = data.map((party, index) => ({
    name: party.partyName || `Party ${party.partyId}`,
    value: party.votes,
    percentage: party.percentage,
    fill: COLORS[index % COLORS.length],
  }));
  
  const chartConfig = {
    votes: {
      label: "Votes",
    },
  };

  return (
    <ChartContainer className="h-[300px]" config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default VotingDistributionChart;
