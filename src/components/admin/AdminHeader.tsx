
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Users, UserCheck, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

const AdminHeader = () => {
  // Get current date and time
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Fetch real-time admin stats
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getElectionStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Show error toast if data fetch fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch real-time election data");
    }
  }, [error]);

  // Calculate time remaining until polls close (6 PM)
  const calculateTimeRemaining = () => {
    const now = new Date();
    const closingTime = new Date();
    closingTime.setHours(18, 0, 0, 0); // 6:00 PM
    
    // If it's past closing time, show 0
    if (now > closingTime) {
      return "00:00:00";
    }
    
    const diffMs = closingTime.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());
  
  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Default stats if API fails
  const stats = data?.stats || {
    totalRegisteredVoters: 854291,
    totalVotesCast: 365637,
    voterTurnoutPercentage: 42.8,
    activePollingStations: 1254,
    activePollingStationsPercentage: 98.2,
    recentChange: 1.2
  };

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
          icon={<Users size={18} />}
          title="Total Voters" 
          value={isLoading ? "Loading..." : stats.totalRegisteredVoters.toLocaleString()} 
          change={"+2.4%"} 
          isPositive={true} 
        />
        
        <StatCard 
          icon={<UserCheck size={18} />}
          title="Turnout %" 
          value={isLoading ? "Loading..." : `${stats.voterTurnoutPercentage.toFixed(1)}%`} 
          change={`+${stats.recentChange}%`} 
          isPositive={true}
        />
        
        <StatCard 
          icon={<TrendingUp size={18} />}
          title="Active Polling Stations" 
          value={isLoading ? "Loading..." : stats.activePollingStations.toLocaleString()} 
          change={`${stats.activePollingStationsPercentage}%`} 
          isPositive={true}
        />
        
        <StatCard 
          icon={<Calendar size={18} />}
          title="Time Remaining" 
          value={timeRemaining} 
          change="Closes 6PM" 
          isPositive={null}
          highlight={true}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string;
  change: string;
  isPositive: boolean | null;
  highlight?: boolean;
}

const StatCard = ({ icon, title, value, change, isPositive, highlight }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-card border border-border rounded-lg p-4 shadow-sm ${
        highlight ? "bg-gradient-to-br from-orange-500/10 to-green-600/10" : ""
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
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
