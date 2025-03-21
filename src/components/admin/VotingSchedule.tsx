
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Bell, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type ScheduleItem = {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notifications: boolean;
  status: "upcoming" | "active" | "completed";
};

const initialSchedules: ScheduleItem[] = [
  {
    id: 1,
    name: "General Elections Phase 1",
    date: "2023-05-15",
    startTime: "07:00",
    endTime: "18:00",
    location: "North & South Districts",
    notifications: true,
    status: "completed"
  },
  {
    id: 2,
    name: "General Elections Phase 2",
    date: "2023-05-22",
    startTime: "07:00",
    endTime: "18:00",
    location: "East & West Districts",
    notifications: true,
    status: "active"
  },
  {
    id: 3,
    name: "General Elections Phase 3",
    date: "2023-05-29",
    startTime: "07:00",
    endTime: "18:00",
    location: "Central District",
    notifications: true,
    status: "upcoming"
  },
  {
    id: 4,
    name: "Final Counting Day",
    date: "2023-06-04",
    startTime: "08:00",
    endTime: "20:00",
    location: "All Districts",
    notifications: true,
    status: "upcoming"
  }
];

const VotingSchedule = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  const handleEdit = (schedule: ScheduleItem) => {
    setEditingId(schedule.id);
    setEditingSchedule({ ...schedule });
  };

  const handleSave = () => {
    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === editingId ? editingSchedule : s));
      setEditingId(null);
      setEditingSchedule(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingSchedule(null);
  };

  const handleChange = (field: keyof ScheduleItem, value: any) => {
    if (editingSchedule) {
      setEditingSchedule({ ...editingSchedule, [field]: value });
    }
  };

  const handleNotificationToggle = (id: number) => {
    setSchedules(
      schedules.map(schedule => 
        schedule.id === id 
          ? { ...schedule, notifications: !schedule.notifications } 
          : schedule
      )
    );
  };

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
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Election Schedule
                </CardTitle>
                <CardDescription>
                  Manage voting periods and event schedules
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Event
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notify</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    {editingId === schedule.id ? (
                      <>
                        <TableCell>
                          <input 
                            type="text" 
                            value={editingSchedule?.name} 
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full bg-background border border-input rounded-md px-2 py-1 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <input 
                            type="date" 
                            value={editingSchedule?.date} 
                            onChange={(e) => handleChange('date', e.target.value)}
                            className="w-full bg-background border border-input rounded-md px-2 py-1 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <input 
                              type="time" 
                              value={editingSchedule?.startTime} 
                              onChange={(e) => handleChange('startTime', e.target.value)}
                              className="bg-background border border-input rounded-md px-2 py-1 text-sm"
                            />
                            <span>-</span>
                            <input 
                              type="time" 
                              value={editingSchedule?.endTime} 
                              onChange={(e) => handleChange('endTime', e.target.value)}
                              className="bg-background border border-input rounded-md px-2 py-1 text-sm"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <input 
                            type="text" 
                            value={editingSchedule?.location} 
                            onChange={(e) => handleChange('location', e.target.value)}
                            className="w-full bg-background border border-input rounded-md px-2 py-1 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <select 
                            value={editingSchedule?.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="bg-background border border-input rounded-md px-2 py-1 text-sm"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={editingSchedule?.notifications}
                            onCheckedChange={(checked) => handleChange('notifications', checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={handleSave}
                            >
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{schedule.name}</TableCell>
                        <TableCell>{formatDate(schedule.date)}</TableCell>
                        <TableCell>{schedule.startTime} - {schedule.endTime}</TableCell>
                        <TableCell>{schedule.location}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            schedule.status === "active" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                              : schedule.status === "upcoming"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {capitalizeFirstLetter(schedule.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={schedule.notifications}
                            onCheckedChange={() => handleNotificationToggle(schedule.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(schedule)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              disabled={schedule.status === "completed"}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Scheduled Notifications
            </CardTitle>
            <CardDescription>
              Automated alerts for election events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Pre-election Reminders</div>
                <Switch checked={true} />
              </div>
              <p className="text-sm text-muted-foreground">
                Send notifications 24 hours before voting begins
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Voting Day Alerts</div>
                <Switch checked={true} />
              </div>
              <p className="text-sm text-muted-foreground">
                Send notifications when polls open and for final hours
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Results Announcements</div>
                <Switch checked={true} />
              </div>
              <p className="text-sm text-muted-foreground">
                Send notifications when election results are declared
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Emergency Alerts</div>
                <Switch checked={true} />
              </div>
              <p className="text-sm text-muted-foreground">
                Send notifications for any critical changes to schedule
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
};

// Helper functions
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default VotingSchedule;
