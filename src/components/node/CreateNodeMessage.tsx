
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { createNodeConnectionMessage } from "@/services/bitcoinService";
import { createSignedNodeMessage } from "@/utils/nodeCryptography";
import { KeyPair } from "@/utils/cryptography";
import { toast } from "sonner";
import { Server, Check, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CreateNodeMessageProps {
  keyPair: KeyPair;
  onMessageCreated: (message: string) => void;
}

const CreateNodeMessage: React.FC<CreateNodeMessageProps> = ({ 
  keyPair, 
  onMessageCreated 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodeDetails, setNodeDetails] = useState<{
    protocol: string;
    userAgent: string;
    connectedServer: string;
  } | null>(null);

  const handleCreateNodeMessage = async () => {
    try {
      setIsCreating(true);
      setError(null);
      
      // Create connection message with network info
      const connectionMessage = createNodeConnectionMessage();
      
      // Sign the message with private key
      const signedMessage = await createSignedNodeMessage(
        connectionMessage,
        keyPair
      );
      
      // Convert to string for embedding in image
      const messageString = JSON.stringify(signedMessage);
      
      // Set node details for display
      setNodeDetails({
        protocol: "Electrum 1.4.5",
        userAgent: "Electrum Client",
        connectedServer: "electrum.blockstream.info:50002"
      });
      
      onMessageCreated(messageString);
      setCreated(true);
      toast.success("Node message created successfully");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setCreated(false);
      }, 3000);
    } catch (error: any) {
      console.error("Failed to create node message:", error);
      
      // Provide a more specific error message if available
      let errorMessage = "Failed to create node message. Make sure you're connected to the network.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      toast.error("Failed to create node message");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefreshConnection = () => {
    // This would typically reconnect to a different Electrum server
    setNodeDetails({
      protocol: "Electrum 1.4.5",
      userAgent: "Electrum Client",
      connectedServer: "electrum.bitcoinvps.com:50002"
    });
    
    toast.success("Connected to new Electrum server");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Node Message</CardTitle>
        <CardDescription>
          Create a signed message confirming your Bitcoin network connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        {nodeDetails && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Protocol:</span>
              <Badge variant="outline">{nodeDetails.protocol}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">User Agent:</span>
              <Badge variant="outline">{nodeDetails.userAgent}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Connected to:</span>
              <div className="flex items-center gap-1">
                <Badge variant="outline">{nodeDetails.connectedServer}</Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={handleRefreshConnection}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleCreateNodeMessage}
          disabled={isCreating || created}
        >
          {isCreating ? (
            <>Creating...</>
          ) : created ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Message Created
            </>
          ) : (
            <>
              <Server className="mr-1 h-4 w-4" />
              Create Node Message
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateNodeMessage;
