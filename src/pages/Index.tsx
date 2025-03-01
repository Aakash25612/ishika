
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { hideMessage, extractMessage } from '@/utils/steganography';
import { generateKeyPair, exportPublicKey, importPublicKey, KeyPair, MessageType } from '@/utils/cryptography';
import DragDrop from '@/components/DragDrop';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Download, 
  Upload, 
  Eye, 
  Lock, 
  Key, 
  MessageSquare, 
  Network, 
  Server, 
  DollarSign,
  Link2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import QuickConnectionsPanel from "@/components/connections/QuickConnectionsPanel";
import NodeModeToggle from "@/components/node/NodeModeToggle";
import CreateNodeMessage from "@/components/node/CreateNodeMessage";
import WalletCard from "@/components/wallet/WalletCard";

const Index = () => {
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [extractedMessage, setExtractedMessage] = useState<{content: string, messageType: MessageType} | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [publicKeyStr, setPublicKeyStr] = useState<string>('');
  const [recipientPublicKey, setRecipientPublicKey] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [messageType, setMessageType] = useState<MessageType>(MessageType.STANDARD);
  const [isNodeModeConnected, setIsNodeModeConnected] = useState(false);

  useEffect(() => {
    const initializeKeyPair = async () => {
      try {
        const newKeyPair = await generateKeyPair();
        setKeyPair(newKeyPair);
        const exportedPublicKey = await exportPublicKey(newKeyPair.publicKey);
        setPublicKeyStr(exportedPublicKey);
      } catch (error) {
        console.error('Failed to generate key pair:', error);
        toast.error('Failed to generate encryption keys');
      }
    };

    initializeKeyPair();
  }, []);

  const handleImageSelect = (file: File) => {
    setImage(file);
    setResult(null);
    setExtractedMessage(null);
  };

  const handleHideMessage = async () => {
    if (!image || !message) {
      toast.error('Please provide both an image and a message');
      return;
    }

    try {
      setProcessing(true);
      const config = {
        isAnonymous,
        recipientPublicKey: recipientPublicKey ? 
          await importPublicKey(recipientPublicKey) : 
          undefined,
        messageType
      };
      
      const processedImage = await hideMessage(
        image,
        message,
        config,
        keyPair?.privateKey
      );
      setResult(processedImage);
      toast.success('Message hidden successfully!');
    } catch (error) {
      toast.error('Failed to hide message');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleExtractMessage = async () => {
    if (!image) {
      toast.error('Please provide an image');
      return;
    }

    try {
      setProcessing(true);
      const messageData = await extractMessage(image, keyPair?.privateKey);
      const parsedMessage = JSON.parse(messageData);
      setExtractedMessage(parsedMessage);
      toast.success('Message extracted successfully!');
    } catch (error) {
      toast.error('Failed to extract message');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = `stego-${image?.name || 'image'}.png`;
      link.click();
    }
  };

  const handleNodeMessageCreated = (nodeMessage: string) => {
    setMessage(nodeMessage);
    setMessageType(MessageType.NODE_MESSAGE);
  };

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case MessageType.STANDARD:
        return <MessageSquare className="h-4 w-4" />;
      case MessageType.CONNECTION_UPDATE:
        return <Network className="h-4 w-4" />;
      case MessageType.NODE_MESSAGE:
        return <Server className="h-4 w-4" />;
      case MessageType.TRANSACTION_REQUEST:
        return <DollarSign className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeLabel = (type: MessageType) => {
    switch (type) {
      case MessageType.STANDARD:
        return "Standard Message";
      case MessageType.CONNECTION_UPDATE:
        return "Connection Update";
      case MessageType.NODE_MESSAGE:
        return "Node Message";
      case MessageType.TRANSACTION_REQUEST:
        return "Transaction Request";
      default:
        return "Unknown Type";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Secure Image Steganography</h1>
              <p className="mt-2 text-muted-foreground">
                Hide and reveal encrypted messages within your images
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <NodeModeToggle onConnectionChange={setIsNodeModeConnected} />
              <Button variant="outline" asChild className="gap-1">
                <Link to="/connections">
                  <Network className="h-4 w-4" />
                  Connections
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {keyPair && (
                <div className="rounded-lg border bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Your Public Key</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(publicKeyStr);
                        toast.success('Public key copied to clipboard');
                      }}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Copy Public Key
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground break-all">{publicKeyStr}</p>
                </div>
              )}
            </div>
            
            <div className="md:row-start-2 md:col-span-2">
              <Tabs defaultValue="hide" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="hide">
                    <Upload className="mr-2 h-4 w-4" />
                    Hide Message
                  </TabsTrigger>
                  <TabsTrigger value="reveal">
                    <Eye className="mr-2 h-4 w-4" />
                    Reveal Message
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hide" className="space-y-6">
                  <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
                    <DragDrop onImageSelect={handleImageSelect} />

                    {image && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="anonymous"
                              checked={isAnonymous}
                              onCheckedChange={setIsAnonymous}
                            />
                            <Label htmlFor="anonymous">Send Anonymously</Label>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="messageType">Message Type</Label>
                            <Select 
                              value={messageType}
                              onValueChange={(value) => setMessageType(value as MessageType)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a message type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={MessageType.STANDARD}>
                                  <div className="flex items-center">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    <span>Standard Message</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value={MessageType.CONNECTION_UPDATE}>
                                  <div className="flex items-center">
                                    <Network className="mr-2 h-4 w-4" />
                                    <span>Connection Update</span>
                                  </div>
                                </SelectItem>
                                <SelectItem 
                                  value={MessageType.NODE_MESSAGE}
                                  disabled={!isNodeModeConnected}
                                >
                                  <div className="flex items-center">
                                    <Server className="mr-2 h-4 w-4" />
                                    <span>Node Message</span>
                                    {!isNodeModeConnected && (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        (Requires Node Mode)
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                                <SelectItem value={MessageType.TRANSACTION_REQUEST}>
                                  <div className="flex items-center">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    <span>Transaction Request</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="recipient">Recipient's Public Key (optional)</Label>
                            <Textarea
                              id="recipient"
                              placeholder="Paste recipient's public key for encrypted message..."
                              value={recipientPublicKey}
                              onChange={(e) => setRecipientPublicKey(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                            <Textarea
                              id="message"
                              placeholder="Enter your secret message..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="min-h-[100px] resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-4">
                          <Button
                            onClick={handleHideMessage}
                            disabled={processing || !message}
                          >
                            {processing ? 'Processing...' : 'Hide Message'}
                          </Button>

                          {result && (
                            <Button
                              variant="secondary"
                              onClick={handleDownload}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {result && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg border bg-card p-4"
                    >
                      <img
                        src={result}
                        alt="Processed"
                        className="mx-auto max-h-[400px] rounded-lg object-contain"
                      />
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="reveal" className="space-y-6">
                  <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
                    <DragDrop onImageSelect={handleImageSelect} />

                    {image && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <Button
                          onClick={handleExtractMessage}
                          disabled={processing}
                          className="w-full"
                        >
                          {processing ? 'Extracting...' : 'Extract Message'}
                        </Button>

                        {extractedMessage && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-lg border bg-muted p-4 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Message Type:</span>
                              <div className="flex items-center gap-1 text-sm">
                                {getMessageTypeIcon(extractedMessage.messageType)}
                                <span>{getMessageTypeLabel(extractedMessage.messageType)}</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="mb-2 text-sm font-medium">Message Content:</h3>
                              <p className="whitespace-pre-wrap text-sm">{extractedMessage.content}</p>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="md:row-span-2 space-y-4">
              <QuickConnectionsPanel />
              
              {isNodeModeConnected && keyPair && (
                <CreateNodeMessage 
                  keyPair={keyPair}
                  onMessageCreated={handleNodeMessageCreated}
                />
              )}

              {/* Bitcoin Wallet Card */}
              <WalletCard />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
