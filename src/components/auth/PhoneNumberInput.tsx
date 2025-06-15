
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CardFooter } from '../ui/card';
import { RotateCw, AlertCircle } from 'lucide-react';

interface PhoneNumberInputProps {
  phoneNumber: string;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  validatePhoneNumber: (phone: string) => boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  phoneNumber,
  onPhoneChange,
  onSubmit,
  isLoading,
  validatePhoneNumber
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="9876543210 or +91 9876543210"
          value={phoneNumber}
          onChange={onPhoneChange}
          className={!validatePhoneNumber(phoneNumber) && phoneNumber.length > 0 ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {!validatePhoneNumber(phoneNumber) && phoneNumber.length > 0 && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Please enter a valid 10-digit Indian phone number
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Indian format: 9876543210 or +91 9876543210
        </p>
        <p className="text-xs text-blue-600 mt-1">
          <strong>Note:</strong> SMS is not implemented yet. Use the debug OTP shown in the success message.
        </p>
      </div>
      
      <CardFooter className="justify-between pt-4 px-0">
        <Button variant="link" size="sm">Need Help?</Button>
        <Button 
          onClick={onSubmit} 
          disabled={isLoading || !validatePhoneNumber(phoneNumber) || !phoneNumber.trim()}
          className="min-w-[100px]"
        >
          {isLoading ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send OTP
        </Button>
      </CardFooter>
    </div>
  );
};

export default PhoneNumberInput;
