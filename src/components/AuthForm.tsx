
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [activeTab, setActiveTab] = useState("phone");
  const navigate = useNavigate();

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Check if it's a valid 10 or 11 digit number
    return digits.length === 10 || digits.length === 11;
  };

  const formatPhoneDisplay = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      const areaCode = digits.slice(-10, -7);
      const exchange = digits.slice(-7, -4);
      const number = digits.slice(-4);
      return `(${areaCode}) ${exchange}-${number}`;
    }
    return phone;
  };

  const handlePhoneSubmit = async () => {
    console.log('Phone submit clicked with phone:', phoneNumber);
    console.log('Phone validation result:', validatePhoneNumber(phoneNumber));
    
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    console.log('Sending OTP request for phone:', phoneNumber);
    
    try {
      console.log('About to call authService.requestOTP...');
      const response = await authService.requestOTP(phoneNumber);
      console.log('OTP request response received:', response);
      
      if (response && response.success) {
        console.log('OTP sent successfully, switching to OTP tab');
        setIsOTPSent(true);
        setActiveTab("otp");
        toast.success('OTP sent to your phone!');
      } else {
        console.log('OTP request failed:', response?.error || 'Unknown error');
        const errorMessage = response?.error || 'Failed to send OTP';
        
        if (errorMessage.includes('not found') || errorMessage.includes('invalid')) {
          toast.error('Phone number not found. Please check your number and try again.');
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('OTP request error caught:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        toast.error('Server error occurred. Please try again or contact support.');
      } else {
        toast.error('Failed to send OTP. Please check your phone number and try again.');
      }
    } finally {
      setIsLoading(false);
      console.log('Phone submit process completed');
    }
  };

  const handleOTPVerification = async () => {
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authService.verifyOTP(phoneNumber, otp);
      
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits, spaces, parentheses, and dashes
    const sanitized = value.replace(/[^\d\s\-\(\)]/g, '');
    setPhoneNumber(sanitized);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Enter your phone number and OTP to proceed.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="otp" disabled={!isOTPSent}>OTP</TabsTrigger>
          </TabsList>
          <TabsContent value="phone">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={!validatePhoneNumber(phoneNumber) && phoneNumber.length > 0 ? 'border-red-500' : ''}
              />
              {!validatePhoneNumber(phoneNumber) && phoneNumber.length > 0 && (
                <p className="text-xs text-red-500">Please enter a valid 10-digit phone number</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                For admin access, use an admin phone number
              </p>
            </div>
            <CardFooter className="justify-between pt-4 px-0">
              <Button variant="link">Need Help?</Button>
              <Button onClick={handlePhoneSubmit} disabled={isLoading || !validatePhoneNumber(phoneNumber) || !phoneNumber.trim()}>
                {isLoading ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send OTP
              </Button>
            </CardFooter>
          </TabsContent>
          <TabsContent value="otp">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to {formatPhoneDisplay(phoneNumber)}
              </p>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <CardFooter className="justify-between pt-4 px-0">
              <Button variant="link" onClick={() => handlePhoneSubmit()}>Resend OTP</Button>
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
