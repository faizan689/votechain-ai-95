
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
import { initFacialRecognition } from '@/services/facialRecognitionService';

interface AuthFormProps {
  onVerificationSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onVerificationSuccess }) => {
  const [voterId, setVoterId] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const navigate = useNavigate();

  const handleVoterIdSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsOTPSent(true);
      setIsLoading(false);
      toast.success('OTP sent successfully!');
    }, 1000);
  };

  const handleOTPVerification = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('OTP verified successfully!');
      localStorage.setItem('isVerified', 'true');
      navigate('/voting'); // Changed from /vote to /voting
    }, 1000);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Enter your Voter ID and OTP to proceed.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voterId" className="space-y-4">
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
            </div>
            <CardFooter className="justify-between">
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
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <CardFooter className="justify-between">
              <Button variant="link">Resend OTP</Button>
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
