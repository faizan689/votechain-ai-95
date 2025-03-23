
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Settings, Check, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";

const WinningThreshold = () => {
  const [threshold, setThreshold] = useState(50);
  const [customThreshold, setCustomThreshold] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getElectionStats,
  });
  
  const stats = data?.stats;
  
  const leadingParty = stats?.partywiseVotes?.[0];
  const secondParty = stats?.partywiseVotes?.[1];
  
  const voteGap = leadingParty && secondParty 
    ? leadingParty.votes - secondParty.votes
    : 0;
  
  const percentageNeeded = 
    stats?.totalRegisteredVoters && stats?.totalVotesCast
      ? Math.ceil((threshold / 100) * stats.totalRegisteredVoters - stats.totalVotesCast)
      : 0;
  
  const votesNeededToWin = 
    leadingParty && secondParty
      ? secondParty.votes > 0 
        ? Math.max(0, secondParty.votes - leadingParty.votes + 1)
        : 0
      : 0;

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
              <Trophy className="h-5 w-5 text-primary" />
              Winning Threshold Analysis
            </CardTitle>
            <CardDescription>
              Track votes needed to achieve victory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                <p>Failed to load threshold data</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Current Vote Gap</h3>
                    <div className="text-3xl font-bold">{voteGap.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Between leading and second party
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Votes Needed to Win</h3>
                    <div className="text-3xl font-bold">
                      {votesNeededToWin === 0 
                        ? <span className="flex items-center text-green-600">
                            <Check className="mr-1 h-5 w-5" /> Leading
                          </span>
                        : votesNeededToWin.toLocaleString()
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      To overtake the current leader
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Threshold Percentage</h3>
                    <span className="bg-secondary px-2 py-1 rounded text-xs font-medium">
                      {threshold}%
                    </span>
                  </div>
                  <Slider
                    value={[threshold]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(values) => setThreshold(values[0])}
                    disabled={!customThreshold}
                  />
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { 
                        setCustomThreshold(false); 
                        setThreshold(50); 
                      }}
                      className={!customThreshold ? "bg-primary/20" : ""}
                    >
                      Simple Majority (50%)
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { 
                        setCustomThreshold(false); 
                        setThreshold(67); 
                      }}
                      className={!customThreshold && threshold === 67 ? "bg-primary/20" : ""}
                    >
                      Super Majority (67%)
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCustomThreshold(true)}
                      className={customThreshold ? "bg-primary/20" : ""}
                    >
                      Custom
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                  <h3 className="text-sm font-medium">Threshold Analysis</h3>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Current Turnout</span>
                      <span>{stats?.voterTurnoutPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats?.voterTurnoutPercentage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Target Threshold</span>
                      <span>{threshold}%</span>
                    </div>
                    <Progress value={threshold} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">Additional Votes Needed</h4>
                      <p className="text-xs text-muted-foreground">
                        To reach {threshold}% threshold
                      </p>
                    </div>
                    <div className="text-xl font-bold">
                      {percentageNeeded > 0 
                        ? percentageNeeded.toLocaleString() 
                        : <span className="flex items-center text-green-600 text-sm">
                            <Check className="mr-1 h-4 w-4" /> Threshold Reached
                          </span>
                      }
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Threshold Settings
            </CardTitle>
            <CardDescription>
              Configure winning conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">Victory Type</div>
                <select className="bg-background border border-input rounded-md px-2 py-1 text-sm">
                  <option>First Past the Post</option>
                  <option>Absolute Majority</option>
                  <option>Qualified Majority</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Minimum Voter Turnout</div>
                <Slider
                  value={[40]}
                  min={0}
                  max={100}
                  step={5}
                  disabled
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>40%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 p-3 rounded-md flex items-start gap-2 text-sm">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p>
                    In First Past the Post elections, a candidate needs only a plurality of votes (more than any other) to win.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button disabled>Save Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
};

export default WinningThreshold;
