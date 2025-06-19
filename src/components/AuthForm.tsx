import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import PhoneNumberInput from './auth/PhoneNumberInput';
import OTPVerification from './auth/OTPVerification';
import { toastMessages } from '@/utils/toastMessages';

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

  // Updated to validate Indian phone numbers (10 digits)
  const validatePhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const formatPhoneDisplay = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      // Format as: +91 98765 43210
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phone;
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

  const handlePhoneSubmit = async () => {
    console.log('Phone submit clicked with phone:', phoneNumber);
    
    if (!phoneNumber.trim()) {
      toast.error(toastMessages.phoneNumberRequired());
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
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
        
        if (response.debug_otp) {
          toast.success(toastMessages.otpSentSuccess(response.debug_otp));
        } else {
          toast.success(toastMessages.otpSentRegular());
        }
      } else {
        console.log('OTP request failed:', response?.error || 'Unknown error');
        const errorMessage = response?.error || 'Failed to send OTP';
        
        if (errorMessage.includes('Too many OTP requests')) {
          toast.error(toastMessages.tooManyAttempts());
        } else if (errorMessage.includes('not found') || errorMessage.includes('invalid')) {
          toast.error(toastMessages.phoneNotFound());
        } else {
          toast.error(toastMessages.networkError());
        }
      }
    } catch (error: any) {
      console.error('OTP request error caught:', error);
      
      if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        toast.error(toastMessages.serverError());
      } else {
        toast.error(toastMessages.networkError());
      }
    } finally {
      setIsLoading(false);
      console.log('Phone submit process completed');
    }
  };

  const handleOTPVerification = async () => {
    if (otp.length < 6) {
      toast.error(toastMessages.otpRequired());
      return;
    }

    setIsLoading(true);
    console.log('Starting OTP verification with:', { phoneNumber, otp });
    
    try {
      const response = await authService.verifyOTP(phoneNumber, otp);
      console.log('OTP verification response:', response);
      
      if (response.success) {
        console.log('OTP verification successful');
        toast.success(toastMessages.otpVerificationSuccess());
        
        // Always navigate to voting page for all users (including admin)
        // Admin users can access admin panel via the header icon
        navigate('/voting');
        
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        console.log('OTP verification failed:', response.error);
        const errorMessage = response.error || 'OTP verification failed';
        
        if (errorMessage.includes('expired')) {
          toast.error(toastMessages.otpExpired());
          setActiveTab("phone");
          setIsOTPSent(false);
          setOtp('');
        } else if (errorMessage.includes('Invalid OTP')) {
          toast.error(toastMessages.otpIncorrect());
        } else {
          toast.error(toastMessages.otpVerificationFailed(errorMessage));
        }
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(toastMessages.otpVerificationError());
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits for Indian phone numbers
    const sanitized = value.replace(/[^\d]/g, '');
    setPhoneNumber(sanitized);
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handlePhoneSubmit();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "otp" && !phoneNumber.trim()) {
      toast.error(toastMessages.phoneNumberRequired());
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
            <PhoneNumberInput
              phoneNumber={phoneNumber}
              onPhoneChange={handlePhoneChange}
              onSubmit={handlePhoneSubmit}
              isLoading={isLoading}
              validatePhoneNumber={validatePhoneNumber}
            />
          </TabsContent>
          
          <TabsContent value="otp" className="space-y-4">
            <OTPVerification
              otp={otp}
              onOtpChange={setOtp}
              onVerify={handleOTPVerification}
              onResend={handleResendOTP}
              phoneNumber={phoneNumber}
              formatPhoneDisplay={formatPhoneDisplay}
              getTimeSinceOTP={getTimeSinceOTP}
              otpSendTime={otpSendTime}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
