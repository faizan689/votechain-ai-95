
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

interface AuthFormProps {
  onVerificationSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onVerificationSuccess }) => {
  const [voterId, setVoterId] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [activeTab, setActiveTab] = useState("voterId");
  const navigate = useNavigate();

  const handleVoterIdSubmit = async () => {
    if (!voterId.trim()) {
      toast.error('Please enter a valid Voter ID');
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real app, this would call the API
      setTimeout(() => {
        setIsOTPSent(true);
        setActiveTab("otp");
        setIsLoading(false);
        toast.success('OTP sent successfully!');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const handleOTPVerification = async () => {
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real app, use authService.verifyOTP
      setTimeout(() => {
        setIsLoading(false);
        toast.success('OTP verified successfully!');
        
        // Special case for admin login
        if (voterId === 'ADMIN123') {
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('isVerified', 'true');
          navigate('/admin');
        } else {
          localStorage.setItem('isAdmin', 'false');
          localStorage.setItem('isVerified', 'true');
          navigate('/voting');
        }
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast.error('OTP verification failed. Please try again.');
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Enter your Voter ID and OTP to proceed.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="voterId">Voter ID</TabsTrigger>
            <TabsTrigger value="otp" disabled={!isOTPSent}>OTP</TabsTrigger>
          </TabsList>
          <TabsContent value="voterId">
            <div className="space-y-2">
              <Label htmlFor="voterId">Voter ID</Label>
              <Input
                id="voterId"
                placeholder="Enter your Voter ID"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                For admin access, use: ADMIN123
              </p>
            </div>
            <CardFooter className="justify-between pt-4 px-0">
              <Button variant="link">Forgot Voter ID?</Button>
              <Button onClick={handleVoterIdSubmit} disabled={isLoading}>
                {isLoading ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send OTP
              </Button>
            </CardFooter>
          </TabsContent>
          <TabsContent value="otp">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <CardFooter className="justify-between pt-4 px-0">
              <Button variant="link" onClick={() => handleVoterIdSubmit()}>Resend OTP</Button>
              <Button onClick={handleOTPVerification} disabled={isLoading}>
                {isLoading ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify OTP
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
