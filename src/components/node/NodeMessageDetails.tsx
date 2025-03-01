
import React, { useState } from "react";
import { verifySignedNodeMessage } from "@/utils/nodeCryptography";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Loader2, Check, X, Copy } from "lucide-react";
import { toast } from "sonner";

interface NodeMessageDetailsProps {
  messageContent: string;
}

const NodeMessageDetails: React.FC<NodeMessageDetailsProps> = ({ messageContent }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [messageDetails, setMessageDetails] = useState<any | null>(null);
  
  const parseNodeMessage = async () => {
    try {
      setIsVerifying(true);
      
      // Parse the node message
      const parsedMessage = JSON.parse(messageContent);
      setMessageDetails(parsedMessage);
      
      // Verify signature if it's a properly formatted node message
      if (
        parsedMessage.message &&
        parsedMessage.signature &&
        parsedMessage.publicKeyStr
      ) {
        const verified = await verifySignedNodeMessage(
          parsedMessage.message,
          parsedMessage.signature,
          parsedMessage.publicKeyStr
        );
        
        setIsVerified(verified);
        
        if (verified) {
          toast.success("Node message signature verified");
        } else {
          toast.error("Invalid node message signature");
        }
      } else {
        setIsVerified(false);
        toast.error("Invalid node message format");
      }
    } catch (error) {
      console.error("Failed to parse node message:", error);
      setIsVerified(false);
      toast.error("Failed to parse node message");
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleCopyPublicKey = () => {
    if (messageDetails?.publicKeyStr) {
      navigator.clipboard.writeText(messageDetails.publicKeyStr);
      toast.success("Public key copied to clipboard");
    }
  };
  
  // When the component mounts, automatically parse the message
  React.useEffect(() => {
    parseNodeMessage();
  }, [messageContent]);
  
  if (!messageDetails) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="ml-2">Parsing node message...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Parse the inner message content (network info)
  let networkInfo = null;
  try {
    if (messageDetails.message) {
      const innerMessage = JSON.parse(messageDetails.message);
      if (innerMessage.networkInfo) {
        networkInfo = innerMessage.networkInfo;
      }
    }
  } catch (error) {
    console.error("Failed to parse inner message:", error);
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Bitcoin Node Message
          {isVerified !== null && (
            <Badge variant={isVerified ? "default" : "destructive"} className="ml-2">
              {isVerified ? "Verified" : "Invalid Signature"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 py-2">
        {networkInfo && (
          <div className="space-y-2 rounded-md bg-muted p-3">
            <h4 className="text-sm font-medium">Network Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Block Height:</span>{" "}
                <span className="font-medium">{networkInfo.blocks}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Connections:</span>{" "}
                <span className="font-medium">{networkInfo.connections}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Network Hash:</span>{" "}
                <span className="font-medium font-mono text-xs">{networkInfo.networkHash}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Timestamp</h4>
          <p className="text-sm">
            {new Date(messageDetails.timestamp).toLocaleString()}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Sender's Public Key</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={handleCopyPublicKey}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs font-mono truncate bg-muted p-2 rounded-md">
            {messageDetails.publicKeyStr}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {isVerified ? (
              <Check className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <X className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className="text-sm">
              {isVerified
                ? "Message is authentic"
                : "Message signature could not be verified"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={parseNodeMessage}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Verifying
              </>
            ) : (
              "Verify Again"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NodeMessageDetails;
