import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/services/api';

interface KYCUploadProps {
  userId: string;
  onComplete: () => void;
}

const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as any);
  }
  return btoa(binary);
};

const KYCUpload: React.FC<KYCUploadProps> = ({ userId, onComplete }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    if (!userId) {
      toast({ title: 'Not authenticated', description: 'Please verify OTP first.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Read file
      const buffer = await file.arrayBuffer();

      // AES-GCM encrypt in-browser
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buffer);

      const base64Data = toBase64(encrypted);
      const ivBase64 = toBase64(iv.buffer);

      // Send to Edge Function for secure storage + DB insert
      const res = await apiRequest<{ success: boolean; document_path?: string; error?: string }>('kyc-submit', {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        base64Data,
        ivBase64
      });

      if (res && (res as any).success) {
        toast({ title: 'KYC uploaded', description: 'Your document was securely stored.' });
        onComplete();
      } else {
        throw new Error((res as any)?.error || 'Upload failed');
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Upload failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm mb-2">Upload a valid government ID (Passport/ID/Driver’s License)</p>
        <Input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={loading} />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleUpload} disabled={!file || loading}>{loading ? 'Uploading…' : 'Submit KYC'}</Button>
      </div>
    </div>
  );
};

export default KYCUpload;
