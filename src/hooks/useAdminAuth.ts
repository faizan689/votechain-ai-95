
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useAdminAuth = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExternalWindow, setIsExternalWindow] = useState(false);
  const navigate = useNavigate();

  // Check admin verification from URL and localStorage
  useEffect(() => {
    console.log("Admin component mounted");
    
    const urlParams = new URLSearchParams(window.location.search);
    const externalParam = urlParams.get('external');
    const isExternal = externalParam === 'true';
    setIsExternalWindow(isExternal);

    const adminVerifiedParam = urlParams.get('adminVerified');
    const isAdminVerified = adminVerifiedParam === 'true';
    
    console.log("External window:", isExternal);
    console.log("Admin verified from URL:", isAdminVerified);

    const checkAuth = () => {
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      console.log("Is admin from localStorage:", isAdmin);
      
      if (isExternal && !isAdmin && isAdminVerified) {
        console.log("Setting admin status from URL parameter");
        localStorage.setItem("isAdmin", "true");
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }
      
      setIsAuthorized(isAdmin);
      setIsLoading(false);
      
      if (!isAdmin && !isExternal) {
        toast.error("You don't have permission to access the admin panel");
        navigate('/', { replace: true });
      }
    };

    setTimeout(checkAuth, 300);
  }, [navigate]);

  return { isAuthorized, isLoading, isExternalWindow };
};
