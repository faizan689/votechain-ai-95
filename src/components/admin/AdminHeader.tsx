
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Clock } from "lucide-react";

const AdminHeader = () => {
  // Get current date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const formattedTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-semibold">
            Election <span className="bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent">Admin Portal</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive monitoring and management of election activities
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-sm bg-secondary/50 rounded-lg px-4 py-2 border border-border">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <ShieldCheck size={16} />
            <span>System Online</span>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Voters" 
          value="854,291" 
          change="+2.4%" 
          isPositive={true} 
        />
        
        <StatCard 
          title="Turnout %" 
          value="42.8%" 
          change="+1.2%" 
          isPositive={true}
        />
        
        <StatCard 
          title="Active Polling Stations" 
          value="1,254" 
          change="98.2%" 
          isPositive={true}
        />
        
        <StatCard 
          title="Time Remaining" 
          value="04:32:15" 
          change="Closes 6PM" 
          isPositive={null}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean | null;
}

const StatCard = ({ title, value, change, isPositive }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-lg p-4 shadow-sm"
    >
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      <p className={`text-xs mt-1 ${
        isPositive === null 
          ? 'text-muted-foreground' 
          : isPositive 
            ? 'text-green-600' 
            : 'text-red-600'
      }`}>
        {change}
      </p>
    </motion.div>
  );
};

export default AdminHeader;
