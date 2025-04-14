
import React from "react";
import { MapPin, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { districtData } from "./mockData";

const GeographyTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            District-wise Turnout
          </CardTitle>
          <CardDescription>
            Voter participation across electoral districts
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
              data={districtData} 
              margin={{ top: 10, right: 30, left: 20, bottom: 15 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={60}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Turnout']} 
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="turnout" name="Turnout %" fill="#FF9933" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            District Statistics
          </CardTitle>
          <CardDescription>
            Detailed breakdown by region
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-auto px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District</TableHead>
                  <TableHead className="text-right">Turnout %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districtData.map((district) => (
                  <TableRow key={district.name}>
                    <TableCell className="font-medium">{district.name}</TableCell>
                    <TableCell className="text-right">{district.turnout.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 space-y-4 px-6 pb-6">
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">Highest turnout:</div>
              <div className="font-medium">West District (46.18%)</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">Lowest turnout:</div>
              <div className="font-medium">Central District (43.05%)</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">Variation:</div>
              <div className="font-medium">3.13%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographyTab;
