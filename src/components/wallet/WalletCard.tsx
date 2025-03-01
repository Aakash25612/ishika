
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BitcoinWallet, 
  generateWallet, 
  loadWallet, 
  saveWallet, 
  updateWalletBalance, 
  hasWallet,
  changeElectrumServer,
  sendBitcoin,
  getTransactionFeeEstimates,
  importWalletFromPrivateKey,
  importWatchOnlyWallet,
  validateBitcoinAddress,
  deleteWallet
} from "@/utils/bitcoinWallet";
import { toast } from "sonner";
import { 
  Wallet, 
  RefreshCcw, 
  Copy, 
  Plus, 
  Eye, 
  EyeOff, 
  Server, 
  ExternalLink,
  Send,
  Download,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Check,
  Import,
  Lock,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WalletCard: React.FC = () => {
  const [wallet, setWallet] = useState<BitcoinWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [changingServer, setChangingServer] = useState(false);
  
  // Send transaction state
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [selectedFeeRate, setSelectedFeeRate] = useState<string>("medium");
  const [sendingTransaction, setSendingTransaction] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  
  // Import wallet state
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importType, setImportType] = useState<"address" | "privateKey">("address");
  const [importValue, setImportValue] = useState("");
  const [importNetwork, setImportNetwork] = useState<"mainnet" | "testnet">("mainnet");
  const [importing, setImporting] = useState(false);
  
  // Transaction details dialog
  const [showTxDetails, setShowTxDetails] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Delete wallet confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load existing wallet or create new one
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        setLoading(true);
        
        // Try to load existing wallet
        const existingWallet = loadWallet();
        
        if (existingWallet) {
          setWallet(existingWallet);
        } else {
          // No wallet found, create a new one
          const newWallet = await generateWallet();
          saveWallet(newWallet);
          setWallet(newWallet);
          toast.success("New Bitcoin wallet created");
        }
      } catch (error) {
        console.error("Wallet initialization failed:", error);
        toast.error("Failed to initialize wallet");
      } finally {
        setLoading(false);
      }
    };

    initializeWallet();
  }, []);
  
  // Handle fee calculation when amount or fee type changes
  useEffect(() => {
    if (showSendDialog && wallet && sendAmount && parseFloat(sendAmount) > 0) {
      calculateEstimatedFee();
    }
  }, [sendAmount, selectedFeeRate, showSendDialog]);

  const handleRefreshBalance = async () => {
    if (!wallet) return;
    
    try {
      setRefreshing(true);
      const updatedWallet = await updateWalletBalance(wallet);
      setWallet(updatedWallet);
    } catch (error) {
      console.error("Failed to update wallet balance:", error);
      toast.error("Failed to update wallet balance");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateNewWallet = async () => {
    try {
      setLoading(true);
      const newWallet = await generateWallet();
      saveWallet(newWallet);
      setWallet(newWallet);
      toast.success("New Bitcoin wallet created");
    } catch (error) {
      console.error("Failed to create new wallet:", error);
      toast.error("Failed to create new wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeServer = async () => {
    if (!wallet) return;
    
    try {
      setChangingServer(true);
      const updatedWallet = await changeElectrumServer(wallet);
      setWallet(updatedWallet);
      toast.success(`Connected to ${updatedWallet.electrumServer}`);
    } catch (error) {
      console.error("Failed to change Electrum server:", error);
      toast.error("Failed to change Electrum server");
    } finally {
      setChangingServer(false);
    }
  };
  
  // Handle importing wallet
  const handleImportWallet = async () => {
    if (!importValue) {
      toast.error("Please enter a value to import");
      return;
    }
    
    try {
      setImporting(true);
      
      let importedWallet: BitcoinWallet;
      
      if (importType === "address") {
        // Validate address format
        if (!validateBitcoinAddress(importValue, importNetwork)) {
          toast.error("Invalid Bitcoin address format");
          return;
        }
        
        // Import as watch-only wallet
        importedWallet = await importWatchOnlyWallet(importValue, importNetwork);
        toast.success("Imported watch-only wallet");
      } else {
        // Import from private key
        importedWallet = await importWalletFromPrivateKey(importValue, importNetwork);
        toast.success("Imported wallet from private key");
      }
      
      saveWallet(importedWallet);
      setWallet(importedWallet);
      setShowImportDialog(false);
      setImportValue("");
      
    } catch (error: any) {
      console.error("Failed to import wallet:", error);
      toast.error(error.message || "Failed to import wallet");
    } finally {
      setImporting(false);
    }
  };
  
  // Handle deleting wallet
  const handleDeleteWallet = () => {
    try {
      deleteWallet();
      setWallet(null);
      setShowDeleteDialog(false);
      toast.success("Wallet deleted");
    } catch (error) {
      console.error("Failed to delete wallet:", error);
      toast.error("Failed to delete wallet");
    }
  };
  
  // Calculate estimated fee for sending transaction
  const calculateEstimatedFee = async () => {
    if (!wallet || !sendAmount || isNaN(parseFloat(sendAmount))) return;
    
    try {
      const feeEstimates = await getTransactionFeeEstimates();
      
      let feeRate;
      switch (selectedFeeRate) {
        case "high":
          feeRate = feeEstimates.fastestFee;
          break;
        case "medium":
          feeRate = feeEstimates.halfHourFee;
          break;
        case "low":
          feeRate = feeEstimates.hourFee;
          break;
        case "min":
          feeRate = feeEstimates.minimumFee;
          break;
        default:
          feeRate = feeEstimates.halfHourFee;
      }
      
      // Estimate transaction size based on address type (simplified)
      let estimatedTxSize = 0;
      if (wallet.addressType === "legacy") {
        estimatedTxSize = 250;
      } else if (wallet.addressType === "segwit") {
        estimatedTxSize = 200;
      } else {
        estimatedTxSize = 150;
      }
      
      // Calculate fee in BTC
      const fee = (estimatedTxSize * feeRate) / 100000000;
      setEstimatedFee(fee);
      
    } catch (error) {
      console.error("Failed to calculate fee:", error);
      setEstimatedFee(null);
    }
  };
  
  // Handle sending Bitcoin
  const handleSendBitcoin = async () => {
    if (!wallet || !recipientAddress || !sendAmount || isNaN(parseFloat(sendAmount))) {
      toast.error("Please fill all fields correctly");
      return;
    }
    
    try {
      setSendingTransaction(true);
      
      // Get fee rate based on selection
      const feeEstimates = await getTransactionFeeEstimates();
      let feeRate;
      
      switch (selectedFeeRate) {
        case "high":
          feeRate = feeEstimates.fastestFee;
          break;
        case "medium":
          feeRate = feeEstimates.halfHourFee;
          break;
        case "low":
          feeRate = feeEstimates.hourFee;
          break;
        case "min":
          feeRate = feeEstimates.minimumFee;
          break;
        default:
          feeRate = feeEstimates.halfHourFee;
      }
      
      // Convert amount from string to number
      const amountBTC = parseFloat(sendAmount);
      
      // Send the transaction
      const result = await sendBitcoin(
        wallet,
        recipientAddress,
        amountBTC,
        feeRate
      );
      
      // Update wallet with fresh data
      const updatedWallet = await updateWalletBalance(wallet);
      setWallet(updatedWallet);
      
      // Close dialog and show success
      setShowSendDialog(false);
      toast.success(`Transaction sent! TXID: ${result.txid.substring(0, 8)}...`);
      
      // Reset form
      setRecipientAddress("");
      setSendAmount("");
      setSelectedFeeRate("medium");
      
    } catch (error: any) {
      console.error("Failed to send transaction:", error);
      toast.error(error.message || "Failed to send transaction");
    } finally {
      setSendingTransaction(false);
    }
  };
  
  // Show transaction details
  const handleShowTxDetails = (tx: any) => {
    setSelectedTx(tx);
    setShowTxDetails(true);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  // Format BTC amount with appropriate decimal places
  const formatBitcoin = (amount: number) => {
    if (amount === undefined || amount === null) return "0.00000000";
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8
    });
  };

  // Get address type badge color
  const getAddressTypeBadge = (type?: "legacy" | "segwit" | "native_segwit") => {
    switch (type) {
      case "legacy":
        return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20">Legacy</Badge>;
      case "segwit":
        return <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20">SegWit</Badge>;
      case "native_segwit":
        return <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20">Native SegWit</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Handle blockchain explorer link
  const openExplorer = (path: string = "") => {
    if (!wallet) return;
    
    // Choose the appropriate explorer based on the network
    const baseUrl = wallet.network === "testnet" 
      ? "https://blockstream.info/testnet/" 
      : "https://blockstream.info/";
    
    window.open(baseUrl + path, "_blank");
  };
  
  // Get style for transaction based on type and confirmations
  const getTransactionStyle = (tx: any) => {
    if (tx.confirmations === 0) {
      return "bg-yellow-50 dark:bg-yellow-900/10";
    }
    return tx.type === "incoming" 
      ? "bg-green-50 dark:bg-green-900/10" 
      : "bg-red-50 dark:bg-red-900/10";
  };
  
  // Get icon for transaction based on type and confirmations
  const getTransactionIcon = (tx: any) => {
    if (tx.confirmations === 0) {
      return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    }
    return tx.type === "incoming" 
      ? <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
      : <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Bitcoin Wallet
          </CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm"
              disabled={refreshing}
              onClick={handleRefreshBalance}
              title="Refresh Balance"
            >
              <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
        <CardDescription className="flex items-center justify-between">
          <span>Your local Bitcoin wallet</span>
          {wallet && (
            <Badge variant={wallet.network === "mainnet" ? "default" : "destructive"}>
              {wallet.network}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <div>
        <Tabs defaultValue="wallet">
          <TabsList className="grid grid-cols-2 mx-4">
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallet" className="p-0">
            <CardContent className="space-y-3 pt-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : wallet ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1">
                        <div className="text-xs text-muted-foreground font-medium">Address</div>
                        {wallet.addressType && getAddressTypeBadge(wallet.addressType)}
                        {wallet.isImported && (
                          <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/20">
                            Imported
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2" 
                          onClick={() => copyToClipboard(wallet.address, "Address copied")}
                          title="Copy Address"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => openExplorer(`address/${wallet.address}`)}
                          title="View in Explorer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded-md text-xs break-all">
                      {wallet.address}
                    </div>
                  </div>
                  
                  {wallet.privateKey && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground font-medium">
                          Private Key 
                          <span className="text-xs text-destructive ml-1">(Keep Secret)</span>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2" 
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                            title={showPrivateKey ? "Hide Private Key" : "Show Private Key"}
                          >
                            {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          {showPrivateKey && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2" 
                              onClick={() => copyToClipboard(wallet.privateKey, "Private key copied")}
                              title="Copy Private Key"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="p-2 bg-muted rounded-md text-xs break-all min-h-[40px]">
                        {showPrivateKey ? wallet.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••'}
                      </div>
                    </div>
                  )}
                  
                  {/* Balance section */}
                  <div className="flex flex-col rounded-md bg-muted p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Balance</span>
                      <span className="text-sm font-bold">
                        {formatBitcoin(wallet.balance)} BTC
                      </span>
                    </div>
                    
                    {wallet.unconfirmedBalance > 0 && (
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                        <span>{formatBitcoin(wallet.unconfirmedBalance)} BTC</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Total received</span>
                      <span>{formatBitcoin(wallet.totalReceived)} BTC</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Total sent</span>
                      <span>{formatBitcoin(wallet.totalSent)} BTC</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setShowSendDialog(true)}
                      disabled={wallet.privateKey === "" || wallet.balance <= 0}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => copyToClipboard(wallet.address, "Address copied to clipboard")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Receive
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Server className="h-3 w-3" />
                        <span>Electrum Server</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={handleChangeServer}
                        disabled={changingServer}
                        title="Change Server"
                      >
                        <RefreshCcw className={cn("h-3 w-3", changingServer && "animate-spin")} />
                      </Button>
                    </div>
                    <div className="text-xs p-2 bg-muted rounded-md">
                      {wallet.electrumServer || "Not connected"}
                    </div>
                    {wallet.lastSynced && (
                      <div className="text-xs text-muted-foreground">
                        Last synced: {new Date(wallet.lastSynced).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">No wallet found</p>
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="transactions" className="p-0">
            <CardContent className="space-y-3 pt-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : wallet ? (
                <>
                  {wallet.transactions && wallet.transactions.length > 0 ? (
                    <div className="space-y-2">
                      {wallet.transactions.map((tx, index) => (
                        <div 
                          key={tx.txid}
                          className={cn(
                            "p-2 rounded-md text-xs flex justify-between items-center cursor-pointer",
                            getTransactionStyle(tx)
                          )}
                          onClick={() => handleShowTxDetails(tx)}
                        >
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(tx)}
                            <div>
                              <div className="font-medium">
                                {tx.type === "incoming" ? "Received" : "Sent"}
                              </div>
                              <div className="text-muted-foreground">
                                {new Date(tx.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {tx.type === "incoming" ? "+" : "-"}{formatBitcoin(tx.amount)} BTC
                            </div>
                            <div className="text-muted-foreground">
                              {tx.confirmations === 0 
                                ? "Pending" 
                                : tx.confirmations === 1 
                                ? "1 confirmation" 
                                : `${tx.confirmations} confirmations`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground text-sm">No transactions found</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Send some Bitcoin to your address to get started
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleRefreshBalance}
                      disabled={refreshing}
                    >
                      <RefreshCcw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
                      Refresh Transactions
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">No wallet found</p>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </div>
      
      <CardFooter className="pt-2 flex gap-2">
        {!wallet ? (
          <>
            <Button 
              variant="default" 
              className="flex-1" 
              disabled={loading} 
              onClick={handleCreateNewWallet}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Wallet
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={loading}
              onClick={() => setShowImportDialog(true)}
            >
              <Import className="mr-2 h-4 w-4" />
              Import Wallet
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="default" 
              className="flex-1" 
              disabled={loading} 
              onClick={() => setShowImportDialog(true)}
            >
              <Import className="mr-2 h-4 w-4" />
              Import Wallet
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={loading}
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Wallet
            </Button>
          </>
        )}
      </CardFooter>
      
      {/* Send Bitcoin Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Bitcoin</DialogTitle>
            <DialogDescription>
              Enter the recipient address and amount to send.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient-address">Recipient Address</Label>
              <Input
                id="recipient-address"
                placeholder="Bitcoin address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (BTC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0.00000001"
                max={wallet?.balance.toString()}
                placeholder="0.00000000"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
              {wallet && (
                <div className="text-xs text-right text-muted-foreground">
                  Available: {formatBitcoin(wallet.balance)} BTC
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fee-rate">Fee Rate</Label>
              <Select value={selectedFeeRate} onValueChange={setSelectedFeeRate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority (Fast)</SelectItem>
                  <SelectItem value="medium">Medium Priority (~30 min)</SelectItem>
                  <SelectItem value="low">Low Priority (~1 hour)</SelectItem>
                  <SelectItem value="min">Minimum (May take hours)</SelectItem>
                </SelectContent>
              </Select>
              
              {estimatedFee !== null && (
                <div className="text-xs text-right text-muted-foreground">
                  Estimated fee: ~{formatBitcoin(estimatedFee)} BTC
                </div>
              )}
            </div>
            
            {wallet && sendAmount && parseFloat(sendAmount) > 0 && estimatedFee && (
              <div className="p-2 bg-muted rounded-md text-xs">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{parseFloat(sendAmount).toFixed(8)} BTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span>~{estimatedFee.toFixed(8)} BTC</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{(parseFloat(sendAmount) + estimatedFee).toFixed(8)} BTC</span>
                </div>
                
                {parseFloat(sendAmount) + estimatedFee > wallet.balance && (
                  <div className="mt-2 flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>Insufficient balance for transaction and fee</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSendDialog(false)}
              disabled={sendingTransaction}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendBitcoin}
              disabled={
                !recipientAddress || 
                !sendAmount || 
                sendingTransaction || 
                (wallet && parseFloat(sendAmount) + (estimatedFee || 0) > wallet.balance)
              }
            >
              {sendingTransaction ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Bitcoin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Wallet Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Bitcoin Wallet</DialogTitle>
            <DialogDescription>
              Import an existing wallet using an address or private key.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="import-type">Import Type</Label>
              <Select 
                value={importType} 
                onValueChange={(value) => setImportType(value as "address" | "privateKey")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select import type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="address">
                    Address (Watch Only)
                  </SelectItem>
                  <SelectItem value="privateKey">
                    Private Key (Full Access)
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                {importType === "address" 
                  ? "Watch-only wallets can only track balances and transactions." 
                  : "Private keys give full control to spend funds."}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="import-value">
                {importType === "address" ? "Bitcoin Address" : "Private Key"}
              </Label>
              <div className="relative">
                <Input
                  id="import-value"
                  type={importType === "privateKey" ? "password" : "text"}
                  placeholder={importType === "address" 
                    ? "Enter Bitcoin address" 
                    : "Enter private key (WIF format)"}
                  value={importValue}
                  onChange={(e) => setImportValue(e.target.value)}
                />
                {importType === "privateKey" && (
                  <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="import-network">Network</Label>
              <Select 
                value={importNetwork} 
                onValueChange={(value) => setImportNetwork(value as "mainnet" | "testnet")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                  <SelectItem value="testnet">Testnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowImportDialog(false)}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImportWallet}
              disabled={!importValue || importing}
            >
              {importing ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Import className="mr-2 h-4 w-4" />
                  Import Wallet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transaction Details Dialog */}
      <Dialog open={showTxDetails} onOpenChange={setShowTxDetails}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          
          {selectedTx && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Transaction ID</Label>
                <div className="flex justify-between items-center">
                  <div className="text-sm break-all">{selectedTx.txid}</div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2" 
                      onClick={() => copyToClipboard(selectedTx.txid, "Transaction ID copied")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => openExplorer(`tx/${selectedTx.txid}`)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="flex items-center mt-1 space-x-1">
                    {selectedTx.type === "incoming" ? (
                      <>
                        <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Received</span>
                      </>
                    ) : (
                      <>
                        <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span>Sent</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center mt-1 space-x-1">
                    {selectedTx.confirmations === 0 ? (
                      <>
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span>Pending</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Confirmed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Amount</Label>
                <div className="text-lg font-bold mt-1">
                  {selectedTx.type === "incoming" ? "+" : "-"}{formatBitcoin(selectedTx.amount)} BTC
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <div className="text-sm mt-1">
                    {new Date(selectedTx.timestamp).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <Label>Time</Label>
                  <div className="text-sm mt-1">
                    {new Date(selectedTx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Confirmations</Label>
                <div className="text-sm mt-1">
                  {selectedTx.confirmations === 0 
                    ? "Pending (0 confirmations)" 
                    : `${selectedTx.confirmations} confirmation${selectedTx.confirmations !== 1 ? "s" : ""}`}
                </div>
              </div>
              
              <div>
                <Label>Fee</Label>
                <div className="text-sm mt-1">
                  {formatBitcoin(selectedTx.fee)} BTC
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setShowTxDetails(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Wallet Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Wallet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this wallet? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-md text-sm text-red-500 dark:text-red-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Warning</span>
              </div>
              <p className="mt-2">
                Make sure you have backed up your private key before deleting this wallet. 
                Without your private key, you will permanently lose access to any funds in this wallet.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteWallet}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WalletCard;
