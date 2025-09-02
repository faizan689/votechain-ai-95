import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Clock, CheckCircle, AlertCircle, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '@/hooks/useWeb3';

interface Transaction {
  id: string;
  type: 'vote' | 'registration' | 'admin';
  hash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  details: string;
}

export function TransactionMonitor() {
  const { isConnected } = useWeb3();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Mock transaction data for demonstration
  useEffect(() => {
    if (isConnected) {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'vote',
          hash: '0x1234...5678',
          timestamp: Date.now() - 300000,
          status: 'confirmed',
          details: 'Vote cast for Party A'
        },
        {
          id: '2',
          type: 'registration',
          hash: '0xabcd...efgh',
          timestamp: Date.now() - 600000,
          status: 'confirmed',
          details: 'Voter registration'
        },
        {
          id: '3',
          type: 'vote',
          hash: '0x9876...5432',
          timestamp: Date.now() - 60000,
          status: 'pending',
          details: 'Vote cast for Party B'
        }
      ];
      setTransactions(mockTransactions);
    }
  }, [isConnected]);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'vote':
        return '🗳️';
      case 'registration':
        return '👤';
      case 'admin':
        return '⚙️';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const openTransaction = (hash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Connect your wallet to monitor transactions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence>
            {transactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {tx.details}
                            </span>
                            {getStatusIcon(tx.status)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <code className="bg-muted px-2 py-0.5 rounded text-xs">
                              {tx.hash}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTransaction(tx.hash)}
                              className="h-5 w-5 p-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(tx.status)}
                        <div className="text-xs text-muted-foreground">
                          {formatTime(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
        
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://sepolia.etherscan.io/', '_blank')}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View All on Etherscan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}