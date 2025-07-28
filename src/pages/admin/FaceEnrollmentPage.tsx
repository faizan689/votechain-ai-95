import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Search, 
  Users, 
  CheckCircle, 
  XCircle, 
  Trash2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { FaceEnrollment } from '@/components/FaceEnrollment';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email?: string;
  phone_number?: string;
  face_verified: boolean;
  created_at: string;
  role: string;
}

interface FaceEnrollmentData {
  id: string;
  user_id: string;
  enrollment_date: string;
  enrolled_by?: string;
  is_active: boolean;
  confidence_threshold: number;
}

const FaceEnrollmentManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<FaceEnrollmentData[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('face_enrollment')
        .select('*')
        .eq('is_active', true)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to fetch enrollments');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchEnrollments()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchEnrollments()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleEnrollmentSuccess = async (faceDescriptor: number[]) => {
    if (!selectedUser) return;

    try {
      const { faceEnrollmentService } = await import('@/services/faceEnrollmentService');
      const result = await faceEnrollmentService.enrollFace(
        selectedUser.id,
        faceDescriptor,
        'admin' // You can get actual admin ID from auth context
      );

      if (result.success) {
        toast.success('Face enrollment completed successfully!');
        setShowEnrollment(false);
        setSelectedUser(null);
        await refreshData();
      } else {
        toast.error(result.error || 'Failed to save face enrollment');
      }
    } catch (error) {
      console.error('Error saving face enrollment:', error);
      toast.error('Failed to save face enrollment');
    }
  };

  const handleRemoveEnrollment = async (userId: string) => {
    try {
      const { faceEnrollmentService } = await import('@/services/faceEnrollmentService');
      const result = await faceEnrollmentService.removeFaceEnrollment(userId);

      if (result.success) {
        toast.success('Face enrollment removed successfully');
        await refreshData();
      } else {
        toast.error(result.error || 'Failed to remove face enrollment');
      }
    } catch (error) {
      console.error('Error removing face enrollment:', error);
      toast.error('Failed to remove face enrollment');
    }
  };

  const filteredUsers = users.filter(user => 
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (user.phone_number?.includes(searchTerm) || '') ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enrolledUsers = users.filter(user => user.face_verified);
  const unenrolledUsers = users.filter(user => !user.face_verified);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  if (showEnrollment && selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Face Enrollment</h2>
            <p className="text-muted-foreground">
              Enrolling face verification for: {selectedUser.email || selectedUser.phone_number}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowEnrollment(false);
              setSelectedUser(null);
            }}
          >
            Cancel
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          <FaceEnrollment
            userId={selectedUser.id}
            onSuccess={handleEnrollmentSuccess}
            onSkip={() => {
              setShowEnrollment(false);
              setSelectedUser(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Face Enrollment Management</h2>
          <p className="text-muted-foreground">
            Manage face verification enrollment for users
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Face Enrolled</p>
              <p className="text-2xl font-bold">{enrolledUsers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Not Enrolled</p>
              <p className="text-2xl font-bold">{unenrolledUsers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Users</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by email, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Users ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="enrolled">Enrolled ({enrolledUsers.length})</TabsTrigger>
          <TabsTrigger value="unenrolled">Not Enrolled ({unenrolledUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <UsersList 
            users={filteredUsers} 
            onEnroll={(user) => {
              setSelectedUser(user);
              setShowEnrollment(true);
            }}
            onRemoveEnrollment={handleRemoveEnrollment}
          />
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          <UsersList 
            users={enrolledUsers.filter(user => 
              (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
              (user.phone_number?.includes(searchTerm) || '') ||
              user.id.toLowerCase().includes(searchTerm.toLowerCase())
            )} 
            onEnroll={(user) => {
              setSelectedUser(user);
              setShowEnrollment(true);
            }}
            onRemoveEnrollment={handleRemoveEnrollment}
          />
        </TabsContent>

        <TabsContent value="unenrolled" className="space-y-4">
          <UsersList 
            users={unenrolledUsers.filter(user => 
              (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
              (user.phone_number?.includes(searchTerm) || '') ||
              user.id.toLowerCase().includes(searchTerm.toLowerCase())
            )} 
            onEnroll={(user) => {
              setSelectedUser(user);
              setShowEnrollment(true);
            }}
            onRemoveEnrollment={handleRemoveEnrollment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface UsersListProps {
  users: User[];
  onEnroll: (user: User) => void;
  onRemoveEnrollment: (userId: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, onEnroll, onRemoveEnrollment }) => {
  if (users.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground">Try adjusting your search criteria</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">
                      {user.email || user.phone_number || 'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                    <p className="text-xs text-muted-foreground">
                      Role: {user.role} | Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant={user.face_verified ? "default" : "secondary"}>
                  {user.face_verified ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enrolled
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Enrolled
                    </>
                  )}
                </Badge>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={user.face_verified ? "outline" : "default"}
                    onClick={() => onEnroll(user)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {user.face_verified ? 'Re-enroll' : 'Enroll'}
                  </Button>

                  {user.face_verified && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemoveEnrollment(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default FaceEnrollmentManagement;