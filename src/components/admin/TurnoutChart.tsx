
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DistrictTurnout } from "@/types/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TurnoutChartProps {
  data: DistrictTurnout[];
}

const TurnoutChart = ({ data }: TurnoutChartProps) => {
  // Format data for chart
  const chartData = data.map(district => ({
    name: district.district,
    turnout: district.turnout,
    votesCast: district.votesCast,
    totalVoters: district.totalVoters,
  }));
  
  const chartConfig = {
    turnout: {
      label: "Turnout %",
    },
  };

  return (
    <ChartContainer className="h-[300px]" config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="turnout" name="Turnout %" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TurnoutChart;
