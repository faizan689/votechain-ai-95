
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { RotateCw, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [otpSendTime, setOtpSendTime] = useState<Date | null>(null);
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
        setOtpSendTime(new Date());
        setActiveTab("otp");
        
        // Show the generated OTP for testing (remove in production)
        if (response.debug_otp) {
          toast.success(
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>OTP sent to your phone!</span>
              </div>
              <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                Test OTP: {response.debug_otp}
              </div>
            </div>
          );
        } else {
          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>OTP sent to your phone!</span>
            </div>
          );
        }
      } else {
        console.log('OTP request failed:', response?.error || 'Unknown error');
        const errorMessage = response?.error || 'Failed to send OTP';
        
        if (errorMessage.includes('Too many OTP requests')) {
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Too many attempts. Please try again later.</span>
            </div>
          );
        } else if (errorMessage.includes('not found') || errorMessage.includes('invalid')) {
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Phone number not found. Please check your number and try again.</span>
            </div>
          );
        } else {
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          );
        }
      }
    } catch (error: any) {
      console.error('OTP request error caught:', error);
      
      if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Server error occurred. Please try again or contact support.</span>
          </div>
        );
      } else {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Failed to send OTP. Please check your phone number and try again.</span>
          </div>
        );
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
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Authentication successful!</span>
          </div>
        );
        
        // Check if admin and redirect accordingly
        if (authService.isAdmin()) {
          navigate('/admin');
        } else {
          // For regular users, proceed to voting
          navigate('/voting');
        }
        
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        const errorMessage = response.error || 'OTP verification failed';
        
        if (errorMessage.includes('expired')) {
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>OTP has expired. Please request a new one.</span>
            </div>
          );
          // Reset to phone tab to request new OTP
          setActiveTab("phone");
          setIsOTPSent(false);
          setOtp('');
        } else if (errorMessage.includes('Invalid OTP')) {
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>❌ Incorrect OTP. The code you entered is wrong.</span>
            </div>
          );
        } else {
          toast.error(
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          );
        }
      }
    } catch (error: any) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span>OTP verification failed. Please try again.</span>
        </div>
      );
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

  const handleResendOTP = async () => {
    // Reset OTP state
    setOtp('');
    // Send new OTP
    await handlePhoneSubmit();
  };

  const getTimeSinceOTP = (): string => {
    if (!otpSendTime) return '';
    const now = new Date();
    const diffMs = now.getTime() - otpSendTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }
    return `${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // If switching to OTP tab without a phone number, prompt for it
    if (value === "otp" && !phoneNumber.trim()) {
      toast.error('Please enter a phone number first');
      setActiveTab("phone");
      return;
    }
  };

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          {activeTab === "phone" 
            ? "Enter your registered phone number to receive an OTP."
            : "Enter the 6-digit code sent to your phone."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="otp">OTP</TabsTrigger>
          </TabsList>
          
          <TabsContent value="phone" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={!validatePhoneNumber(phoneNumber) && phoneNumber.length > 0 ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {!validatePhoneNumber(phoneNumber) && phoneNumber.length > 0 && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Please enter a valid 10-digit phone number
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                For admin access, use an admin phone number
              </p>
            </div>
            
            <CardFooter className="justify-between pt-4 px-0">
              <Button variant="link" size="sm">Need Help?</Button>
              <Button 
                onClick={handlePhoneSubmit} 
                disabled={isLoading || !validatePhoneNumber(phoneNumber) || !phoneNumber.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send OTP
              </Button>
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="otp" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="otp">OTP Code</Label>
              {phoneNumber ? (
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to {formatPhoneDisplay(phoneNumber)}
                  {otpSendTime && (
                    <span className="block mt-1">Sent {getTimeSinceOTP()}</span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Please enter your phone number first to receive an OTP
                </p>
              )}
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isLoading || !phoneNumber}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                The code will expire in 5 minutes
              </p>
            </div>
            
            <CardFooter className="justify-between pt-4 px-0">
              <Button 
                variant="link" 
                size="sm"
                onClick={handleResendOTP}
                disabled={isLoading || !phoneNumber}
              >
                Resend OTP
              </Button>
              <Button 
                onClick={handleOTPVerification} 
                disabled={isLoading || otp.length < 6 || !phoneNumber}
                className="min-w-[100px]"
              >
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
