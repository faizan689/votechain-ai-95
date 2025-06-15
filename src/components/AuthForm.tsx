
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
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const navigate = useNavigate();

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authService.requestOTP(email);
      
      if (response.success) {
        setIsOTPSent(true);
        setActiveTab("otp");
        toast.success('OTP sent to your email!');
      } else {
        toast.error(response.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error('Failed to send OTP. Please try again.');
      console.error('OTP request error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authService.verifyOTP(email, otp);
      
      if (response.success) {
        toast.success('Authentication successful!');
        
        // Check if admin and redirect accordingly
        if (authService.isAdmin()) {
          navigate('/admin');
        } else {
          // For regular users, proceed to facial verification
          navigate('/voting');
        }
        
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        toast.error(response.error || 'OTP verification failed');
      }
    } catch (error: any) {
      toast.error('OTP verification failed. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Enter your email and OTP to proceed.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="otp" disabled={!isOTPSent}>OTP</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                For admin access, use an admin email address
              </p>
            </div>
            <CardFooter className="justify-between pt-4 px-0">
              <Button variant="link">Need Help?</Button>
              <Button onClick={handleEmailSubmit} disabled={isLoading}>
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
              <Button variant="link" onClick={() => handleEmailSubmit()}>Resend OTP</Button>
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
