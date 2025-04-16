import React from "react";
import { motion } from "framer-motion";
import { Activity, Clock, Trophy, Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const partyColors = {
  bjp: "#FF9933",
  inc: "#0078D7",
  aap: "#019934",
  nota: "#6B7280",
};

const voteData = [
  { time: "7AM", bjp: 1200, inc: 1000, aap: 800, nota: 300 },
  { time: "8AM", bjp: 5600, inc: 4800, aap: 3500, nota: 1200 },
  { time: "9AM", bjp: 12000, inc: 10500, aap: 7800, nota: 2600 },
  { time: "10AM", bjp: 24000, inc: 21000, aap: 15000, nota: 4800 },
  { time: "11AM", bjp: 38000, inc: 33000, aap: 23000, nota: 7100 },
  { time: "12PM", bjp: 54000, inc: 46000, aap: 32000, nota: 9400 },
  { time: "1PM", bjp: 72000, inc: 62000, aap: 41000, nota: 12000 },
  { time: "2PM", bjp: 90000, inc: 77000, aap: 51000, nota: 14200 },
  { time: "3PM", bjp: 108000, inc: 91000, aap: 60000, nota: 16800 },
  { time: "4PM", bjp: 125000, inc: 104000, aap: 68000, nota: 19000 },
];

const pollingStations = [
  { id: 1, name: "North Delhi-01", status: "Active", voterCount: 1243, startTime: "07:00", issues: 0 },
  { id: 2, name: "South Delhi-05", status: "Active", voterCount: 982, startTime: "07:00", issues: 0 },
  { id: 3, name: "East Delhi-03", status: "Active", voterCount: 1051, startTime: "07:15", issues: 1 },
  { id: 4, name: "West Delhi-08", status: "Active", voterCount: 873, startTime: "07:00", issues: 0 },
  { id: 5, name: "Central Delhi-02", status: "Slow", voterCount: 456, startTime: "07:30", issues: 2 },
];

const ElectionProgress = () => {
  // Calculate rates ahead of time
  const votingRates = voteData.map((entry, index) => {
    if (index === 0) return { time: entry.time, rate: 0 };
    const current = entry.bjp + entry.inc + entry.aap + entry.nota;
    const previous = voteData[index - 1].bjp + voteData[index - 1].inc + voteData[index - 1].aap + voteData[index - 1].nota;
    return { time: entry.time, rate: current - previous };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Live Vote Count by Party
          </CardTitle>
          <CardDescription>
            Real-time tracking of votes received by each party
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{ 
              bjp: { color: partyColors.bjp, label: "BJP" },
              inc: { color: partyColors.inc, label: "INC" },
              aap: { color: partyColors.aap, label: "AAP" },
              nota: { color: partyColors.nota, label: "NOTA" }
            }} 
            className="h-80"
          >
            <AreaChart data={voteData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="bjp" name="BJP" stackId="1" stroke={partyColors.bjp} fill={partyColors.bjp} fillOpacity={0.6} />
              <Area type="monotone" dataKey="inc" name="INC" stackId="1" stroke={partyColors.inc} fill={partyColors.inc} fillOpacity={0.6} />
              <Area type="monotone" dataKey="aap" name="AAP" stackId="1" stroke={partyColors.aap} fill={partyColors.aap} fillOpacity={0.6} />
              <Area type="monotone" dataKey="nota" name="NOTA" stackId="1" stroke={partyColors.nota} fill={partyColors.nota} fillOpacity={0.6} />
            </AreaChart>
          </ChartContainer>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <VoteCard party="BJP" votes={125000} color={partyColors.bjp} />
            <VoteCard party="INC" votes={104000} color={partyColors.inc} />
            <VoteCard party="AAP" votes={68000} color={partyColors.aap} />
            <VoteCard party="NOTA" votes={19000} color={partyColors.nota} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Active Polling Stations
            </CardTitle>
            <CardDescription>
              Status of all polling stations currently accepting votes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Voters</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pollingStations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium">{station.id}</TableCell>
                    <TableCell>{station.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        station.status === "Active" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {station.status}
                      </span>
                    </TableCell>
                    <TableCell>{station.voterCount}</TableCell>
                    <TableCell className="text-center">
                      {station.issues > 0 ? (
                        <span className="text-red-500 font-medium">{station.issues}</span>
                      ) : (
                        <span className="text-green-500">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Voting Rate
            </CardTitle>
            <CardDescription>
              Average votes being cast per minute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{ 
                rate: { color: "#FF9933" } 
              }} 
              className="h-[280px] w-full"
            >
              <LineChart 
                data={votingRates} 
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis width={40} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line 
                  type="monotone"
                  name="Votes per hour" 
                  dataKey="rate"
                  stroke="#FF9933" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-secondary/30 rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground">Current Rate</div>
                <div className="text-2xl font-bold">458</div>
                <div className="text-xs text-muted-foreground">votes/minute</div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground">Peak Rate</div>
                <div className="text-2xl font-bold">612</div>
                <div className="text-xs text-muted-foreground">at 11:45 AM</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

const VoteCard = ({ party, votes, color }: { party: string; votes: number; color: string }) => (
  <div className="bg-card border border-border rounded-lg p-4 text-center">
    <div 
      className="w-3 h-3 rounded-full mx-auto mb-2" 
      style={{ backgroundColor: color }}
    />
    <div className="text-sm text-muted-foreground">{party}</div>
    <div className="text-xl font-bold mt-1">{votes.toLocaleString()}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => {
      const value = typeof entry.value === 'number' ? entry.value : 0;
      return sum + value;
    }, 0);
    
    return (
      <div className="bg-background border border-border rounded-md p-3 shadow-md text-sm">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
            </div>
            <span>{typeof entry.value === 'number' ? entry.value.toLocaleString() : '0'} votes</span>
          </div>
        ))}
        <div className="border-t border-border mt-2 pt-2 font-medium flex justify-between">
          <span>Total</span>
          <span>{total.toLocaleString()} votes</span>
        </div>
      </div>
    );
  }
  return null;
};

export default ElectionProgress;
