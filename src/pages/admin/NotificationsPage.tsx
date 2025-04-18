
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, Trash2, AlertTriangle, UserCheck, BarChart } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";

// Animation variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

interface Notification {
  id: number;
  type: 'registration' | 'security' | 'milestone';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  icon: React.ElementType;
  iconColor: string;
  iconBgColor: string;
}

// Mock notifications data
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'security',
    title: 'Suspicious Activity Detected',
    description: 'Multiple failed verification attempts from IP 103.54.12.87',
    time: '10 minutes ago',
    isRead: false,
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBgColor: 'bg-amber-100'
  },
  {
    id: 2,
    type: 'registration',
    title: 'New Voter Registered',
    description: 'Voter ID: BTR78932 has completed registration process',
    time: '25 minutes ago',
    isRead: true,
    icon: UserCheck,
    iconColor: 'text-green-500',
    iconBgColor: 'bg-green-100'
  },
  {
    id: 3,
    type: 'milestone',
    title: '1,000 Votes Milestone Reached',
    description: 'The voting system has recorded 1,000 votes',
    time: '2 hours ago',
    isRead: false,
    icon: BarChart,
    iconColor: 'text-blue-500',
    iconBgColor: 'bg-blue-100'
  },
  {
    id: 4,
    type: 'security',
    title: 'Deepfake Detection Alert',
    description: 'Potential deepfake detected during verification for voter INR56782',
    time: '3 hours ago',
    isRead: false,
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBgColor: 'bg-red-100'
  },
  {
    id: 5,
    type: 'milestone',
    title: '30% Turnout Reached',
    description: 'Voter turnout has reached 30% of registered voters',
    time: '4 hours ago',
    isRead: true,
    icon: BarChart,
    iconColor: 'text-purple-500',
    iconBgColor: 'bg-purple-100'
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.isRead;
    return notification.type === activeFilter;
  });

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariant} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              View and manage system notifications and alerts
            </p>
          </div>
          <div className="flex items-center gap-2 self-end">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4" />
              <span>Mark all as read</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={deleteAllNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear all</span>
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <span>All</span>
              {notifications.length > 0 && (
                <Badge variant="secondary">{notifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <span>Unread</span>
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="milestone">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter}>
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <span>
                      {activeFilter === 'all' && 'All Notifications'}
                      {activeFilter === 'unread' && 'Unread Notifications'}
                      {activeFilter === 'security' && 'Security Alerts'}
                      {activeFilter === 'registration' && 'Registration Updates'}
                      {activeFilter === 'milestone' && 'Voting Milestones'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                      <p className="mt-4 text-muted-foreground">No notifications to display</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredNotifications.map((notification) => (
                        <motion.div 
                          key={notification.id}
                          initial={{ opacity: 1 }}
                          className={`flex items-start p-4 rounded-lg border ${notification.isRead ? 'bg-transparent' : 'bg-muted/30'}`}
                        >
                          <div className={`p-2 rounded-full ${notification.iconBgColor} mr-3`}>
                            <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${notification.isRead ? '' : 'font-semibold'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{notification.description}</p>
                          </div>
                          <div className="flex items-center ml-2 space-x-1">
                            <Toggle 
                              pressed={notification.isRead} 
                              onPressedChange={() => markAsRead(notification.id)}
                              aria-label="Mark as read"
                              size="sm"
                            >
                              <Check className="h-4 w-4" />
                            </Toggle>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteNotification(notification.id)}
                              aria-label="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
}
