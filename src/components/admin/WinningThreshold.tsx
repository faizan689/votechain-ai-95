
import React from "react";
import { motion } from "framer-motion";
import { Target, Trophy, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const partyColors = {
  bjp: "#FF9933",
  inc: "#0078D7",
  aap: "#019934",
  nota: "#6B7280",
};

const currentResults = [
  { name: "BJP", value: 125000, color: partyColors.bjp },
  { name: "INC", value: 104000, color: partyColors.inc },
  { name: "AAP", value: 68000, color: partyColors.aap },
  { name: "NOTA", value: 19000, color: partyColors.nota },
];

const totalVotes = currentResults.reduce((sum, item) => sum + item.value, 0);
const totalRegisteredVoters = 854291;
const votesCast = totalVotes;

const WinningThreshold = () => {
  const calculateLeadingMargin = () => {
    const sortedResults = [...currentResults].sort((a, b) => b.value - a.value);
    const leadingParty = sortedResults[0];
    const secondParty = sortedResults[1];
    
    return {
      party: leadingParty.name,
      votes: leadingParty.value,
      margin: leadingParty.value - secondParty.value,
      marginPercent: ((leadingParty.value - secondParty.value) / votesCast * 100).toFixed(2),
      color: leadingParty.color
    };
  };
  
  const leadingData = calculateLeadingMargin();
  
  // Majority threshold is 50% of votes cast + 1
  const majorityThreshold = Math.floor(votesCast / 2) + 1;
  const remainingForMajority = Math.max(0, majorityThreshold - leadingData.votes);
  
  // If no one has majority, calculate what's needed to reach it
  const needsForMajority = remainingForMajority > 0 
    ? { votes: remainingForMajority, percent: (remainingForMajority / votesCast * 100).toFixed(2) }
    : null;

  // Calculate percentages for each party
  const resultsWithPercentage = currentResults.map(result => ({
    ...result,
    percentage: ((result.value / votesCast) * 100).toFixed(2)
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Majority Threshold
            </CardTitle>
            <CardDescription>
              Votes needed to secure a majority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{majorityThreshold.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {(majorityThreshold / votesCast * 100).toFixed(2)}% of total votes cast
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-medium">{leadingData.party} (Current lead)</div>
                  <div className="text-sm text-muted-foreground">
                    {leadingData.votes.toLocaleString()} votes ({(leadingData.votes / votesCast * 100).toFixed(2)}%)
                  </div>
                </div>
                <Progress 
                  value={(leadingData.votes / majorityThreshold) * 100} 
                  className="h-2"
                  style={{ backgroundColor: 'rgba(100, 100, 100, 0.2)' }}
                />
              </div>

              <div className="bg-secondary/30 p-4 rounded-lg">
                {needsForMajority ? (
                  <>
                    <div className="text-sm font-medium mb-2">Votes needed for majority</div>
                    <div className="flex items-baseline">
                      <div className="text-xl font-bold">{needsForMajority.votes.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground ml-2">
                        additional votes ({needsForMajority.percent}%)
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium mb-2">Majority already secured</div>
                    <div className="flex items-center text-green-600">
                      <Trophy className="h-4 w-4 mr-2" />
                      <span className="text-xl font-bold">{leadingData.party}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              Current Vote Share
            </CardTitle>
            <CardDescription>
              Distribution of votes by percentage
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] flex items-center justify-center">
            <ChartContainer 
              config={{ 
                bjp: { color: partyColors.bjp },
                inc: { color: partyColors.inc },
                aap: { color: partyColors.aap },
                nota: { color: partyColors.nota } 
              }} 
              className="h-full"
            >
              <PieChart>
                <Pie
                  data={resultsWithPercentage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={true}
                >
                  {resultsWithPercentage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} votes (${((value / votesCast) * 100).toFixed(2)}%)`, 'Votes']}
                />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Leading Margin
            </CardTitle>
            <CardDescription>
              Current lead and victory projection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold"
                style={{ 
                  backgroundColor: `${leadingData.color}20`,
                  color: leadingData.color
                }}
              >
                {leadingData.party}
              </div>
              
              <div className="mt-4">
                <div className="text-2xl font-bold">{leadingData.votes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total votes</div>
              </div>
            </div>
            
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-sm font-medium mb-1">Current lead</div>
                <div className="flex items-baseline">
                  <div className="text-xl font-bold">{leadingData.margin.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground ml-2">
                    votes ({leadingData.marginPercent}%)
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="text-sm font-medium mb-1">Votes remaining to count</div>
                <div className="flex items-baseline">
                  <div className="text-xl font-bold">
                    {(totalRegisteredVoters - votesCast).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground ml-2">
                    potential votes
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                <div className="text-sm font-medium mb-1">Victory prediction</div>
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  <span>{leadingData.party} – 92% probability</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default WinningThreshold;
