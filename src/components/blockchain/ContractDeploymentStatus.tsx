import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export function ContractDeploymentStatus() {
  const placeholderAddress = "0x0000000000000000000000000000000000000000";
  // This will be dynamically loaded or replaced when contract is deployed
  const contractAddress: string = placeholderAddress;
  const isDeployed = contractAddress !== placeholderAddress;

  const openDeploymentGuide = () => {
    window.open('/deployment-guide.md', '_blank');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Smart Contract Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isDeployed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Contract Not Deployed
              </Badge>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Blockchain Features Unavailable</h4>
              <p className="text-sm text-yellow-700 mb-3">
                The voting smart contract needs to be deployed to Sepolia testnet to enable blockchain voting features.
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 mb-3">
                <li>• MetaMask wallet connection will work</li>
                <li>• Blockchain voting requires contract deployment</li>
                <li>• Traditional voting through database still works</li>
              </ul>
            </div>

            <Button
              onClick={openDeploymentGuide}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Deployment Guide
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Contract Deployed
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contract Address:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {formatAddress(contractAddress)}
                </code>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}