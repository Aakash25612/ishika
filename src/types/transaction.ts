
/**
 * Enum representing different Bitcoin transaction types
 */
export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive'
}

/**
 * Interface representing a Bitcoin transaction
 */
export interface BitcoinTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  fee?: number;
  timestamp: string;
  confirmations: number;
  sender: string;
  recipient: string;
  blockHeight?: number;
  status: 'pending' | 'confirmed' | 'failed';
  txid?: string; // Transaction ID on the Bitcoin blockchain
}
