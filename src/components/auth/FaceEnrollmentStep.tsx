import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FaceEnrollment } from '@/components/FaceEnrollment';

interface FaceEnrollmentStepProps {
  userId: string;
  onEnrollmentComplete: () => void;
  onSkip?: () => void;
}

export const FaceEnrollmentStep: React.FC<FaceEnrollmentStepProps> = ({
  userId,
  onEnrollmentComplete,
  onSkip
}) => {
  const [showEnrollment, setShowEnrollment] = useState(false);

  const handleSuccess = (faceDescriptor: number[]) => {
    console.log('Face enrollment successful for user:', userId);
    onEnrollmentComplete();
  };

  if (showEnrollment) {
    return (
      <FaceEnrollment
        userId={userId}
        onSuccess={handleSuccess}
        onSkip={onSkip}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <UserPlus className="w-16 h-16 mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Set Up Face Verification</h3>
          <p className="text-muted-foreground">
            For enhanced security, we recommend setting up face verification. 
            This will allow you to quickly and securely access your account.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-left space-y-2">
            <h4 className="font-medium text-sm">Benefits:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Quick and secure authentication</li>
              <li>• Enhanced account protection</li>
              <li>• Seamless voting experience</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={() => setShowEnrollment(true)} className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Set Up Face Verification
          </Button>
          
          {onSkip && (
            <Button variant="outline" onClick={onSkip} className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Without Face Verification
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          You can set this up later in your account settings
        </p>
      </motion.div>
    </Card>
  );
};