import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { WalletConnection } from '@/components/blockchain/WalletConnection';
import { BlockchainStatus } from '@/components/blockchain/BlockchainStatus';
import { TransactionMonitor } from '@/components/blockchain/TransactionMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, Lock, Users, Vote, Activity } from 'lucide-react';

export default function Blockchain() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Immutable Records",
      description: "All votes are permanently recorded on the Ethereum blockchain, ensuring tamper-proof election results."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Multi-Signature Security",
      description: "Administrative actions require multiple signatures from authorized parties for enhanced security."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Biometric Verification",
      description: "Facial recognition ensures one person, one vote while maintaining privacy through cryptographic hashing."
    },
    {
      icon: <Vote className="w-6 h-6" />,
      title: "Transparent Voting",
      description: "Real-time vote counting and public verification of election integrity on the blockchain."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Blockchain Voting Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of democratic participation with our blockchain-powered voting system
            running on Ethereum Sepolia Testnet.
          </p>
          <div className="flex justify-center mt-6">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Activity className="w-4 h-4 mr-2" />
              Live on Ethereum Sepolia
            </Badge>
          </div>
        </motion.div>

        {/* Blockchain Integration Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
        >
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Wallet Connection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <WalletConnection />
          </motion.div>

          {/* Blockchain Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BlockchainStatus />
          </motion.div>

          {/* Transaction Monitor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 xl:col-span-1"
          >
            <TransactionMonitor />
          </motion.div>
        </div>

        {/* Smart Contract Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Smart Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Network</h4>
                  <p className="text-sm text-muted-foreground">Ethereum Sepolia Testnet</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Chain ID</h4>
                  <p className="text-sm text-muted-foreground">11155111</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contract Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Biometric voter registration</li>
                    <li>• Secure vote casting with face verification</li>
                    <li>• Multi-signature admin controls</li>
                    <li>• Real-time vote counting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Security Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• One person, one vote enforcement</li>
                    <li>• Immutable vote records</li>
                    <li>• Emergency pause functionality</li>
                    <li>• Access control with roles</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <h4 className="font-medium">Quick Links</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://sepolia.etherscan.io/', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Sepolia Explorer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://sepoliafaucet.com/', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get Test ETH
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://metamask.io/', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Install MetaMask
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}