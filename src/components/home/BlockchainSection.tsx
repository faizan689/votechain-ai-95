import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Users, 
  Activity,
  ExternalLink,
  ArrowRight,
  Zap
} from 'lucide-react';

export function BlockchainSection() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Immutable Records",
      description: "Every vote is permanently recorded on the Ethereum blockchain",
      color: "text-blue-600"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Multi-Signature Security",
      description: "Administrative actions require multiple authorized signatures",
      color: "text-green-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Biometric Verification",
      description: "Secure voter registration with facial recognition technology",
      color: "text-purple-600"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-time Transparency",
      description: "Live vote counting and public verification on blockchain",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Powered by Ethereum Blockchain
            </Badge>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Blockchain-Powered Democracy
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of secure, transparent, and decentralized voting 
            with our Ethereum Sepolia Testnet integration.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`flex justify-center mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Connect Your MetaMask Wallet
              </h3>
              <p className="text-muted-foreground mb-6">
                Join the blockchain revolution in democratic participation. 
                Connect your MetaMask wallet to cast tamper-proof votes on 
                the Ethereum Sepolia Testnet.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completely free on Sepolia Testnet</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Your votes are permanently recorded</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Public verification available</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/blockchain">
                  <Button className="group">
                    Explore Blockchain
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://sepolia.etherscan.io/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">Smart Contract</div>
                    <div className="text-sm text-muted-foreground">
                      Ethereum Sepolia
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span>Sepolia Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chain ID:</span>
                    <span>11155111</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}