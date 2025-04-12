
import { useState, useEffect, useRef } from "react";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraActive: boolean;
  cameraLoading: boolean;
  cameraError: string | null;
  enableCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera({ facingMode = "user" }: UseCameraOptions = {}): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const enableCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    
    try {
      // Stop any existing streams
      stopCamera();
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setCameraActive(true);
        setStream(newStream);
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setCameraError("Failed to access camera. Please check your permissions and try again.");
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  useEffect(() => {
    enableCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    cameraActive,
    cameraLoading,
    cameraError,
    enableCamera,
    stopCamera,
  };
}
