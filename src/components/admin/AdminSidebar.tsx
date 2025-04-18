
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Shield, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  MessageSquare
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number | string;
};

export default function AdminSidebar() {
  const location = useLocation();
  const { toast } = useToast();

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Messages", path: "/admin/messages", icon: MessageSquare, badge: 2 },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Notifications", path: "/admin/notifications", icon: Bell, badge: 3 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    window.location.href = "/";
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-border/40 bg-zinc-900 w-[60px] transition-all duration-200">
      <SidebarContent className="px-2 py-4">
        <div className="mb-4 flex justify-center">
          <Shield className="h-6 w-6 text-emerald-500" />
        </div>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path} className="my-1">
              <SidebarMenuButton 
                asChild
                isActive={isActive(item.path)}
                tooltip={item.name}
                className="relative w-10 h-10 p-0 justify-center"
              >
                <Link to={item.path} className="flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-2">
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
