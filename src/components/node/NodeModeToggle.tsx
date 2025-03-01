
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  connectToBitcoinNetwork, 
  disconnectFromBitcoinNetwork, 
  isConnectedToBitcoinNetwork,
  getNetworkInfo
} from "@/services/bitcoinService";
import { toast } from "sonner";
import { Bitcoin, Server, Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface NodeModeToggleProps {
  onConnectionChange: (isConnected: boolean) => void;
}

const NodeModeToggle: React.FC<NodeModeToggleProps> = ({ onConnectionChange }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [refreshingInfo, setRefreshingInfo] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<{
    connections: number;
    blocks: number;
    difficulty: number;
    networkHash: string;
    connectedSince: Date;
  } | null>(null);

  useEffect(() => {
    // Check initial connection status
    const connectionStatus = isConnectedToBitcoinNetwork();
    setIsConnected(connectionStatus);
    setIsEnabled(connectionStatus);
    
    if (connectionStatus) {
      setNetworkInfo(getNetworkInfo());
      onConnectionChange(true);
    }
    
    // Clean up on unmount
    return () => {
      // If the component is unmounted while connected, ensure we disconnect
      if (isConnected) {
        disconnectFromBitcoinNetwork().catch(console.error);
      }
    };
  }, [onConnectionChange]);

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked);
    setConnectionError(null);
    
    if (checked) {
      setIsConnecting(true);
      
      try {
        const connected = await connectToBitcoinNetwork();
        setIsConnected(connected);
        
        if (connected) {
          setNetworkInfo(getNetworkInfo());
          toast.success("Connected to Bitcoin network");
          onConnectionChange(true);
        } else {
          setConnectionError("Could not establish connection to Bitcoin network");
          toast.error("Failed to connect to Bitcoin network");
          onConnectionChange(false);
        }
      } catch (error: any) {
        console.error("Connection error:", error);
        setConnectionError(error.message || "Unknown connection error");
        toast.error("Connection error occurred");
        setIsConnected(false);
        onConnectionChange(false);
      } finally {
        setIsConnecting(false);
      }
    } else {
      try {
        await disconnectFromBitcoinNetwork();
        setIsConnected(false);
        setNetworkInfo(null);
        toast.success("Disconnected from Bitcoin network");
        onConnectionChange(false);
      } catch (error) {
        console.error("Disconnection error:", error);
        toast.error("Error disconnecting from network");
      }
    }
  };

  const refreshNetworkInfo = async () => {
    if (!isConnected) return;
    
    setRefreshingInfo(true);
    
    try {
      // Force a reconnect to refresh network info
      await connectToBitcoinNetwork();
      setNetworkInfo(getNetworkInfo());
      toast.success("Network information updated");
    } catch (error) {
      console.error("Failed to refresh network info:", error);
      toast.error("Failed to update network information");
    } finally {
      setRefreshingInfo(false);
    }
  };

  const handleRetryConnection = async () => {
    setConnectionError(null);
    handleToggle(true);
  };

  const connectionStatusVariants = {
    connected: { 
      backgroundColor: "rgb(22, 163, 74)", 
      transition: { duration: 0.3 } 
    },
    connecting: { 
      backgroundColor: "rgb(234, 179, 8)",
      transition: { duration: 0.3 } 
    },
    disconnected: { 
      backgroundColor: "rgb(220, 38, 38)", 
      transition: { duration: 0.3 } 
    },
    error: {
      backgroundColor: "rgb(220, 38, 38)",
      transition: { duration: 0.3 }
    }
  };

  const getStatusState = () => {
    if (connectionError) return "error";
    if (isConnecting) return "connecting";
    return isConnected ? "connected" : "disconnected";
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch
          id="node-mode"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isConnecting}
        />
        <Label htmlFor="node-mode" className="cursor-pointer">
          Node Mode
        </Label>
      </div>
      
      <div className="flex items-center gap-2">
        <motion.div
          animate={getStatusState()}
          variants={connectionStatusVariants}
          className="h-3 w-3 rounded-full"
        />
        
        <span className="text-sm">
          {connectionError ? "Connection Error" : 
           isConnecting ? "Connecting..." : 
           isConnected ? "Connected" : "Disconnected"}
        </span>
        
        {isConnected && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 h-8" 
            onClick={() => setShowDetails(true)}
          >
            <Server className="h-4 w-4" />
          </Button>
        )}
        
        {connectionError && (
          <Button
            variant="ghost"
            size="sm"
            className="px-2 h-8 text-destructive"
            onClick={handleRetryConnection}
            title="Retry connection"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        
        {isConnecting && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </div>
      
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5" />
              Bitcoin Network Connection
            </DialogTitle>
            <DialogDescription>
              Current Bitcoin network connection status
            </DialogDescription>
          </DialogHeader>
          
          {networkInfo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Connected to Bitcoin network</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Connections</span>
                  <Badge variant="outline" className="w-fit mt-1">
                    {networkInfo.connections}
                  </Badge>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Block Height</span>
                  <Badge variant="outline" className="w-fit mt-1">
                    {networkInfo.blocks.toLocaleString()}
                  </Badge>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Difficulty</span>
                  <Badge variant="outline" className="w-fit mt-1">
                    {networkInfo.difficulty}
                  </Badge>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Network Hash</span>
                  <Badge variant="outline" className="w-fit mt-1">
                    {networkInfo.networkHash}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col border-t pt-2">
                <span className="text-sm text-muted-foreground">Connected Since</span>
                <span className="text-sm">
                  {networkInfo.connectedSince.toLocaleString()}
                </span>
              </div>
            </div>
          ) : connectionError ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Connection Error</span>
              </div>
              
              <div className="p-3 bg-destructive/10 rounded-md text-sm">
                {connectionError}
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Troubleshooting:</span>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Try connecting to a different network</li>
                  <li>Some public networks block Bitcoin traffic</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Not connected to Bitcoin network</span>
            </div>
          )}
          
          <DialogFooter>
            {isConnected ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshNetworkInfo}
                disabled={refreshingInfo}
              >
                {refreshingInfo ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Refresh Info
              </Button>
            ) : connectionError ? (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleRetryConnection}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry Connection
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NodeModeToggle;
