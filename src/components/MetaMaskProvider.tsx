import React, { createContext, useContext, ReactNode } from 'react';
import { MetaMaskProvider as MetaMaskSDKProvider } from '@metamask/sdk-react';

const MetaMaskContext = createContext<any>(null);

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within MetaMaskProvider');
  }
  return context;
};

interface MetaMaskProviderProps {
  children: ReactNode;
}

export function MetaMaskProvider({ children }: MetaMaskProviderProps) {
  return (
    <MetaMaskSDKProvider 
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "VoteGuard - Secure Blockchain Voting",
          url: window.location.host,
          iconUrl: "/favicon.ico",
        },
        infuraAPIKey: undefined, // Infura API key not available in Lovable environment
        checkInstallationImmediately: false,
        checkInstallationOnAllCalls: true,
      }}
    >
      <MetaMaskContext.Provider value={null}>
        {children}
      </MetaMaskContext.Provider>
    </MetaMaskSDKProvider>
  );
}