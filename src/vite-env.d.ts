
/// <reference types="vite/client" />

// Extend the Window interface to include ethereum property for MetaMask/wallet extensions
declare global {
  interface Window {
    ethereum?: {
      providers?: any[];
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    } & any;
  }
}

// This export statement makes TypeScript treat this as a module
export {};
