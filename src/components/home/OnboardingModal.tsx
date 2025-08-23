import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PhoneNumberInput from '@/components/auth/PhoneNumberInput';
import OTPVerification from '@/components/auth/OTPVerification';
import { FaceEnrollmentStep } from '@/components/auth/FaceEnrollmentStep';
import { authService } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';


interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'phone' | 'otp' | 'face' | 'done';

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSendTime, setOtpSendTime] = useState<Date | null>(null);

  const validatePhoneNumber = (phone: string) => /^\d{10}$/.test(phone.trim());
  const formatPhoneDisplay = (phone: string) => `+91 ${phone.slice(0,3)}-${phone.slice(3,6)}-${phone.slice(6)}`;
  const getTimeSinceOTP = () => {
    if (!otpSendTime) return '';
    const diff = Math.floor((Date.now() - otpSendTime.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const min = Math.floor(diff / 60);
    const sec = diff % 60;
    return `${min}m ${sec}s ago`;
  };

  const handleRequestOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) return;
    setIsLoading(true);
    try {
      const res = await authService.requestOTP(phoneNumber);
      if (res.success) {
        setOtpSendTime(new Date());
        setStep('otp');
        toast({ title: 'OTP sent', description: 'Check your phone for the verification code.' });
      } else {
        toast({ title: 'Failed to send OTP', description: res.error || 'Please try again.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
    try {
      const res = await authService.verifyOTP(phoneNumber, otp);
      if (res.success) {
        toast({ title: 'Verified', description: 'Phone number verified successfully.' });
        setStep('face');
      } else {
        toast({ title: 'Verification failed', description: res.error || 'Please try again.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Get started</DialogTitle>
          <DialogDescription>Register or log in and enroll your face to vote securely.</DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <PhoneNumberInput
            phoneNumber={phoneNumber}
            onPhoneChange={(e) => setPhoneNumber(e.target.value)}
            onSubmit={handleRequestOTP}
            isLoading={isLoading}
            validatePhoneNumber={validatePhoneNumber}
          />
        )}

        {step === 'otp' && (
          <OTPVerification
            otp={otp}
            onOtpChange={setOtp}
            onVerify={handleVerifyOTP}
            onResend={handleRequestOTP}
            phoneNumber={phoneNumber}
            formatPhoneDisplay={formatPhoneDisplay}
            getTimeSinceOTP={getTimeSinceOTP}
            otpSendTime={otpSendTime}
            isLoading={isLoading}
          />
        )}


        {step === 'face' && (
          <FaceEnrollmentStep
            userId={userId}
            onEnrollmentComplete={() => {
              toast({ title: 'Face enrolled', description: 'Facial data captured successfully.' });
              setStep('done');
            }}
          />
        )}

        {step === 'done' && (
          <div className="space-y-3">
            <p className="text-sm">All set! Your account is ready.</p>
            <div className="text-sm grid gap-2">
              <div>• Phone verified</div>
              <div>• Face enrolled</div>
            </div>
            <a href="/voting" className="underline">Go to Voting</a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
